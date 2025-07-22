import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { api } from "@/lib/api";
import { insertInvoiceSchema } from "@shared/schema";
import type { Client, Invoice } from "@/lib/types";

const invoiceFormSchema = insertInvoiceSchema.extend({
  clientId: z.number(),
  issueDate: z.string(),
  dueDate: z.string(),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  invoice?: Invoice | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function InvoiceForm({ invoice, onSuccess, onCancel }: InvoiceFormProps) {
  const { toast } = useToast();

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/clients"],
  });

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      clientId: invoice?.clientId || 0,
      issueDate: invoice?.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      dueDate: invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: invoice?.subtotal || "0",
      vatAmount: invoice?.vatAmount || "0",
      total: invoice?.total || "0",
      notes: invoice?.notes || "",
      paymentTerms: invoice?.paymentTerms || "30 jours",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const payload = {
        ...data,
        issueDate: new Date(data.issueDate).toISOString(),
        dueDate: new Date(data.dueDate).toISOString(),
      };
      const response = await api.createInvoice(payload);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/invoices"] });
      toast({
        title: "Facture créée",
        description: "La facture a été créée avec succès.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la facture.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InvoiceFormData) => {
    createMutation.mutate(data);
  };

  const getClientName = (client: Client) => {
    return client.type === 'professionnel' 
      ? client.companyName || 'Société sans nom'
      : `${client.firstName} ${client.lastName}`;
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Client Selection */}
      <div className="space-y-2">
        <Label htmlFor="clientId" className="text-foreground">Client *</Label>
        <Select
          value={form.watch("clientId")?.toString() || ""}
          onValueChange={(value) => form.setValue("clientId", parseInt(value))}
        >
          <SelectTrigger className="bg-muted border-border text-foreground">
            <SelectValue placeholder="Sélectionner un client" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id.toString()} className="text-foreground">
                {getClientName(client)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.clientId && (
          <p className="text-sm text-red-400">{form.formState.errors.clientId.message}</p>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="issueDate" className="text-foreground">Date d'émission *</Label>
          <Input
            id="issueDate"
            type="date"
            {...form.register("issueDate")}
            className="bg-muted border-border text-foreground"
          />
          {form.formState.errors.issueDate && (
            <p className="text-sm text-red-400">{form.formState.errors.issueDate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate" className="text-foreground">Date d'échéance *</Label>
          <Input
            id="dueDate"
            type="date"
            {...form.register("dueDate")}
            className="bg-muted border-border text-foreground"
          />
          {form.formState.errors.dueDate && (
            <p className="text-sm text-red-400">{form.formState.errors.dueDate.message}</p>
          )}
        </div>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subtotal" className="text-foreground">Sous-total (€) *</Label>
          <Input
            id="subtotal"
            type="number"
            step="0.01"
            min="0"
            {...form.register("subtotal")}
            className="bg-muted border-border text-foreground"
          />
          {form.formState.errors.subtotal && (
            <p className="text-sm text-red-400">{form.formState.errors.subtotal.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="vatAmount" className="text-foreground">TVA (€)</Label>
          <Input
            id="vatAmount"
            type="number"
            step="0.01"
            min="0"
            {...form.register("vatAmount")}
            className="bg-muted border-border text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="total" className="text-foreground">Total (€) *</Label>
          <Input
            id="total"
            type="number"
            step="0.01"
            min="0"
            {...form.register("total")}
            className="bg-muted border-border text-foreground"
          />
          {form.formState.errors.total && (
            <p className="text-sm text-red-400">{form.formState.errors.total.message}</p>
          )}
        </div>
      </div>

      {/* Payment Terms */}
      <div className="space-y-2">
        <Label htmlFor="paymentTerms" className="text-foreground">Conditions de paiement</Label>
        <Select
          value={form.watch("paymentTerms") || "30 jours"}
          onValueChange={(value) => form.setValue("paymentTerms", value)}
        >
          <SelectTrigger className="bg-muted border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="À réception" className="text-foreground">À réception</SelectItem>
            <SelectItem value="15 jours" className="text-foreground">15 jours</SelectItem>
            <SelectItem value="30 jours" className="text-foreground">30 jours</SelectItem>
            <SelectItem value="45 jours" className="text-foreground">45 jours</SelectItem>
            <SelectItem value="60 jours" className="text-foreground">60 jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-foreground">Notes</Label>
        <Textarea
          id="notes"
          {...form.register("notes")}
          className="bg-muted border-border text-foreground"
          rows={3}
          placeholder="Notes ou commentaires pour cette facture..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="border-border">
          Annuler
        </Button>
        <Button type="submit" disabled={createMutation.isPending} className="bg-secondary hover:bg-secondary/90">
          {createMutation.isPending ? "Création..." : "Créer la facture"}
        </Button>
      </div>
    </form>
  );
}
