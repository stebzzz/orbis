import * as React from "react";
import { useState, useEffect } from "react";
import { useForm, useFieldArray, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Plus, X } from "lucide-react";
import type { Invoice, Client, CatalogItem, InsertInvoice } from "@shared/schema";
import { invoicesService, clientsService, catalogItemsService, lineItemsService } from "@/lib/firebase-service";
import { insertInvoiceSchema } from "@shared/schema";

const lineItemSchema = z.object({
  product: z.string().min(1, "Le produit est requis"),
  description: z.string().min(1, "La description est requise"),
  quantity: z.number().min(1, "La quantité doit être supérieure à 0"),
  unitPrice: z.number().min(0, "Le prix unitaire doit être positif"),
  vatRate: z.number().min(0).max(100, "Le taux de TVA doit être entre 0 et 100"),
});

const invoiceFormSchema = insertInvoiceSchema.extend({
  clientId: z.string({ required_error: "Veuillez sélectionner un client" }),
  issueDate: z.string().min(1, "Date d'émission requise"),
  dueDate: z.string().min(1, "Date d'échéance requise"),
  lineItems: z.array(lineItemSchema).min(1, "Au moins une ligne requise"),
}).omit({ issueDate: true, dueDate: true }).extend({
  issueDate: z.string(),
  dueDate: z.string(),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

interface InvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice;
  onSuccess?: () => void;
}

export function InvoiceModal({ open, onOpenChange, invoice, onSuccess }: InvoiceModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditing = !!invoice;
  const [clients, setClients] = useState<Client[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        const [clientsData, catalogData] = await Promise.all([
          clientsService.getAll(user.id),
          catalogItemsService.getAll(user.id)
        ]);
        setClients(clientsData);
        setCatalogItems(catalogData);
        
        // Générer le prochain numéro de facture si on crée une nouvelle facture
        if (!isEditing && user?.id) {
          const nextNumber = await invoicesService.getNextInvoiceNumber(user.id);
          setNextInvoiceNumber(nextNumber);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Erreur",
          description: "Erreur lors du chargement des données",
          variant: "destructive",
        });
      }
    };
    
    if (open) {
      loadData();
    }
  }, [open, toast, isEditing, invoice?.id, user?.id]);

  // Date par défaut à 30 jours
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 30);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      clientId: invoice?.clientId?.toString() || "",
      number: invoice?.number || nextInvoiceNumber || `INV-${Date.now()}`,
      status: invoice?.status || "brouillon",
      issueDate: invoice?.issueDate ? (() => {
        const date = new Date(invoice.issueDate);
        return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
      })() : new Date().toISOString().split('T')[0],
      dueDate: invoice?.dueDate ? (() => {
        const date = new Date(invoice.dueDate);
        return isNaN(date.getTime()) ? defaultDueDate.toISOString().split('T')[0] : date.toISOString().split('T')[0];
      })() : defaultDueDate.toISOString().split('T')[0],
      subtotal: invoice?.subtotal || 0,
      vatAmount: invoice?.vatAmount || 0,
      total: invoice?.total || 0,
      notes: invoice?.notes || "",
      paymentTerms: invoice?.paymentTerms || "30 jours",
      lineItems: invoice?.id ? [] : [{ description: "Prestation", quantity: 1, unitPrice: 0, vatRate: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  // Mettre à jour le numéro de facture quand nextInvoiceNumber change
  useEffect(() => {
    if (!isEditing && nextInvoiceNumber) {
      form.setValue('number', nextInvoiceNumber);
    }
  }, [nextInvoiceNumber, isEditing, form]);

  // Charger les line items existants quand le formulaire est prêt
  useEffect(() => {
    const loadLineItems = async () => {
      if (isEditing && invoice?.id && form) {
        try {
          const existingLineItems = await lineItemsService.getByInvoiceId(invoice.id);
          if (existingLineItems.length > 0) {
            form.reset({
              ...form.getValues(),
              lineItems: existingLineItems.map(item => ({
                product: item.product || '',
                description: item.description || '',
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || 0,
                vatRate: item.vatRate || 0
              }))
            });
          }
        } catch (error) {
          console.error('Error loading line items:', error);
        }
      }
    };
    
    if (open) {
      loadLineItems();
    }
  }, [open, isEditing, invoice?.id, form]);

  const watchedLineItems = form.watch("lineItems");
  const subtotal = watchedLineItems?.reduce((sum: number, item: {quantity: number, unitPrice: number}) => sum + (item.quantity * item.unitPrice), 0) || 0;
  const vatAmount = 0; // TVA 0% comme demandé
  const total = subtotal + vatAmount;

  const handleSubmit = async (data: InvoiceFormData) => {
    try {
      setIsLoading(true);
      
      // Debug: Log user authentication status
      console.log('User authentication status:', {
        user: user,
        userId: user?.id,
        isAuthenticated: !!user
      });
      
      if (!user?.id) {
        throw new Error('Utilisateur non authentifié');
      }
      
      // Validate clientId
      if (!data.clientId || data.clientId.trim() === '') {
        throw new Error('Veuillez sélectionner un client');
      }
      
      // Generate invoice number if creating new invoice
      const invoiceNumber = isEditing ? invoice.number : (nextInvoiceNumber || `INV-${Date.now()}`);
      
      const invoiceData: Partial<InsertInvoice> = {
        userId: user.id,
        clientId: data.clientId,
        number: invoiceNumber,
        status: 'brouillon' as const,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        subtotal: subtotal,
        vatAmount: vatAmount,
        total: total,
        notes: data.notes,
        paymentTerms: data.paymentTerms,
      };
      
      console.log('Invoice data to save:', invoiceData);

      let invoiceId: string;
      if (isEditing && invoice?.id) {
        console.log('Updating invoice with ID:', invoice.id);
        await invoicesService.update(invoice.id.toString(), invoiceData);
        invoiceId = invoice.id.toString();
      } else {
        console.log('Creating new invoice');
        invoiceId = await invoicesService.create(invoiceData);
        console.log('New invoice created with ID:', invoiceId);
      }
      
      // Supprimer les anciens line items si on édite une facture
      if (isEditing && invoice?.id) {
        await lineItemsService.deleteByInvoiceId(invoiceId);
      }
      
      // Sauvegarder les lignes de facture
      const lineItemsData = data.lineItems.map(item => ({
        invoiceId: invoiceId,
        product: item.product,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate,
        amount: item.quantity * item.unitPrice
      }));
      
      if (lineItemsData.length > 0) {
        await lineItemsService.createMultiple(lineItemsData);
        console.log('Line items saved:', lineItemsData.length);
      }
      
      toast({
        title: "Succès",
        description: isEditing ? "Facture modifiée avec succès" : "Facture créée avec succès",
      });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving invoice:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        code: (error as any)?.code,
        details: (error as any)?.details
      });
      toast({
        title: "Erreur",
        description: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addCatalogItem = (item: CatalogItem) => {
    append({
      product: item.name,
      description: item.description || item.name,
      quantity: 1,
      unitPrice: item.unitPrice,
      vatRate: item.vatRate || 0,
    });
  };

  const onSubmit = (data: InvoiceFormData) => {
    console.log('Invoice form submission triggered');
    console.log('Invoice form data:', data);
    console.log('Invoice form errors:', form.formState.errors);
    console.log('Invoice form is valid:', form.formState.isValid);
    handleSubmit(data);
  };

  // Debug invoice form state
  console.log('Current invoice form state:', {
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting
  });
  
  // Debug specific errors
  if (Object.keys(form.formState.errors).length > 0) {
    console.log('Detailed form errors:', JSON.stringify(form.formState.errors, null, 2));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la facture" : "Nouvelle facture"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifiez les informations de la facture ci-dessous." : "Créez une nouvelle facture en remplissant les informations ci-dessous."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value)} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => {
                          const clientName = client.type === 'professionnel' 
                            ? client.companyName || 'Société sans nom'
                            : `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client sans nom';
                          return (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {clientName}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conditions de paiement</FormLabel>
                    <FormControl>
                      <Input placeholder="30 jours" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d'émission *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d'échéance *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notes additionnelles..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Catalogue d'articles */}
            {catalogItems.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Ajouter depuis le catalogue</h3>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {catalogItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addCatalogItem(item)}
                      className="flex justify-between items-center p-2 text-sm border rounded hover:bg-accent"
                    >
                      <span>{item.description || item.name}</span>
                      <span className="font-medium">{item.unitPrice}€</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lignes de la facture */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Lignes de la facture</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ product: "Nouveau produit", description: "Nouvelle prestation", quantity: 1, unitPrice: 0, vatRate: 0 })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une ligne
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.product`}
                      render={({ field }) => (
                        <FormItem>
                          {index === 0 && <FormLabel>Produit</FormLabel>}
                          <FormControl>
                            <Input placeholder="Nom du produit..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          {index === 0 && <FormLabel>Description</FormLabel>}
                          <FormControl>
                            <Input placeholder="Description de la prestation..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          {index === 0 && <FormLabel>Qté</FormLabel>}
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          {index === 0 && <FormLabel>Prix unitaire (€)</FormLabel>}
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.vatRate`}
                      render={({ field }) => (
                        <FormItem>
                          {index === 0 && <FormLabel>TVA (%)</FormLabel>}
                          <Select onValueChange={(value) => field.onChange(parseFloat(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="TVA" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">0% (Auto-entrepreneur)</SelectItem>
                              <SelectItem value="5.5">5,5% (Taux réduit)</SelectItem>
                              <SelectItem value="10">10% (Taux intermédiaire)</SelectItem>
                              <SelectItem value="20">20% (Taux normal)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormItem>
                      {index === 0 && <FormLabel className="invisible">Action</FormLabel>}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </FormItem>
                  </div>

                  <div className="col-span-1 text-right">
                    {index === 0 && <FormLabel>Total</FormLabel>}
                    <div className="text-sm font-medium">
                      {((watchedLineItems[index]?.quantity || 0) * (watchedLineItems[index]?.unitPrice || 0)).toFixed(2)}€
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totaux */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total HT:</span>
                <span>{subtotal.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>TVA (0%):</span>
                <span>{vatAmount.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total TTC:</span>
                <span>{total.toFixed(2)}€</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : (isEditing ? "Modifier" : "Créer")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}