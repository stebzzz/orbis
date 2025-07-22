import * as React from "react";
import { useState, useEffect } from "react";
import { useForm, useFieldArray, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { quotesService, clientsService, catalogItemsService } from "@/lib/firebase-service";
import { Plus, X } from "lucide-react";
import type { Quote, Client, CatalogItem, InsertQuote } from "@shared/schema";

const lineItemSchema = z.object({
  description: z.string().min(1, "Description requise"),
  quantity: z.number().min(1, "Quantité minimum 1"),
  unitPrice: z.number().min(0, "Prix unitaire minimum 0"),
});

import { insertQuoteSchema } from "@shared/schema";

const quoteFormSchema = insertQuoteSchema.extend({
  clientId: z.string(),
  validityDate: z.string(),
  lineItems: z.array(lineItemSchema).min(1, "Au moins une ligne requise"),
}).omit({ issueDate: true, validityDate: true }).extend({
  issueDate: z.date().optional(),
  validityDate: z.string(),
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

interface QuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote?: Quote;
  onSuccess?: () => void;
}

export function QuoteModal({ open, onOpenChange, quote, onSuccess }: QuoteModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const isEditing = !!quote;

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user?.id) return;
        
        const [clientsData, catalogData] = await Promise.all([
          clientsService.getAll(user.id),
          catalogItemsService.getAll(user.id)
        ]);
        setClients(clientsData);
        setCatalogItems(catalogData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        });
      }
    };

    if (open) {
      loadData();
    }
  }, [open, toast]);

  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 30);

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      clientId: quote?.clientId?.toString() || "",
      number: quote?.number || `DEV-${Date.now()}`,
      status: quote?.status || "brouillon",
      issueDate: quote?.issueDate || new Date(),
      validityDate: quote?.validityDate ? new Date(quote.validityDate).toISOString().split('T')[0] : defaultDueDate.toISOString().split('T')[0],
      subtotal: quote?.subtotal || 0,
      vatAmount: quote?.vatAmount || 0,
      total: quote?.total || 0,
      notes: quote?.notes || "",
      termsConditions: quote?.termsConditions || "",
      lineItems: quote?.id ? [] : [{ description: "Prestation", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  const watchedLineItems = form.watch("lineItems");
  const subtotal = watchedLineItems?.reduce((sum: number, item: {quantity: number, unitPrice: number}) => sum + (item.quantity * item.unitPrice), 0) || 0;
  const vatAmount = 0; // TVA 0% comme demandé
  const total = subtotal + vatAmount;

  const handleQuoteSubmit = async (data: QuoteFormData) => {
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
      
      // Generate quote number if creating new quote
      const quoteNumber = isEditing ? quote.number : `DEV-${Date.now()}`;
      
      const quoteData: Partial<InsertQuote> = {
        userId: user.id,
        clientId: data.clientId,
        number: quoteNumber,
        status: 'brouillon' as const,
        issueDate: new Date(),
        validityDate: new Date(data.validityDate),
        subtotal: subtotal,
        vatAmount: vatAmount,
        total: total,
        notes: data.notes,
        termsConditions: data.termsConditions,
      };
      
      console.log('Quote data to save:', quoteData);

      if (isEditing && quote?.id) {
        console.log('Updating quote with ID:', quote.id);
        await quotesService.update(quote.id.toString(), quoteData);
      } else {
        console.log('Creating new quote');
        const newQuoteId = await quotesService.create(quoteData, user.id);
        console.log('New quote created with ID:', newQuoteId);
      }
      
      toast({
        title: "Succès",
        description: isEditing ? "Devis modifié avec succès" : "Devis créé avec succès",
      });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving quote:', error);
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
      description: item.description || item.name,
      quantity: 1,
      unitPrice: item.unitPrice,
    });
  };

  const onSubmit = (data: QuoteFormData) => {
    console.log('Form submission triggered');
    console.log('Form data:', data);
    console.log('Form errors:', form.formState.errors);
    console.log('Form is valid:', form.formState.isValid);
    handleQuoteSubmit(data);
  };

  // Debug form state
  console.log('Current form state:', {
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
            {isEditing ? "Modifier le devis" : "Nouveau devis"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifiez les informations du devis ci-dessous." : "Créez un nouveau devis en remplissant les informations ci-dessous."}
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
                name="termsConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conditions générales</FormLabel>
                    <FormControl>
                      <Input placeholder="Conditions générales..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="validityDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de validité *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div></div>
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

            {/* Lignes du devis */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Lignes du devis</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une ligne
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
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

                  <div className="col-span-3">
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