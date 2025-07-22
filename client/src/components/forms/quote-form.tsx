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
import { quotesService, clientsService } from "@/lib/firebase-service";
import { useAuth } from "@/hooks/useAuth";
import { insertQuoteSchema } from "@shared/schema";
import type { Client, Quote } from "@/lib/types";

const quoteFormSchema = insertQuoteSchema.extend({
  clientId: z.number(),
  issueDate: z.string(),
  validityDate: z.string(),
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

interface QuoteFormProps {
  quote?: Quote | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function QuoteForm({ quote, onSuccess, onCancel }: QuoteFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/clients"],
    queryFn: async () => {
      if (!user) return [];
      return await clientsService.getAll(user.id);
    },
    enabled: !!user,
  });

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      clientId: quote?.clientId || 0,
      issueDate: quote?.issueDate ? new Date(quote.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      validityDate: quote?.validityDate ? new Date(quote.validityDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: quote?.subtotal || "0",
      vatAmount: quote?.vatAmount || "0",
      total: quote?.total || "0",
      notes: quote?.notes || "",
      termsConditions: quote?.termsConditions || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: QuoteFormData) => {
      if (!user) throw new Error("Utilisateur non connecté");
      
      // Générer un numéro de devis unique
      const quoteNumber = `D-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      const payload = {
        ...data,
        userId: user.id,
        number: quoteNumber,
        status: 'brouillon',
        issueDate: new Date(data.issueDate),
        validityDate: new Date(data.validityDate),
        subtotal: parseFloat(data.subtotal.toString()),
        vatAmount: parseFloat(data.vatAmount?.toString() || '0'),
        total: parseFloat(data.total.toString()),
      };
      
      const quoteId = await quotesService.create(payload, user.id);
      return { id: quoteId, ...payload };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/quotes"] });
      toast({
        title: "Devis créé",
        description: "Le devis a été créé avec succès.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Erreur lors de la création du devis:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le devis.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: QuoteFormData) => {
      if (!quote || !user) return null;
      
      const payload = {
        ...quote,
        ...data,
        userId: user.id,
        issueDate: new Date(data.issueDate),
        validityDate: new Date(data.validityDate),
        subtotal: parseFloat(data.subtotal.toString()),
        vatAmount: parseFloat(data.vatAmount?.toString() || '0'),
        total: parseFloat(data.total.toString()),
      };
      
      await quotesService.update(quote.id, payload, user.id);
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/quotes"] });
      toast({
        title: "Devis mis à jour",
        description: "Le devis a été mis à jour avec succès.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Erreur lors de la mise à jour du devis:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le devis.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuoteFormData) => {
    if (quote) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
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
          <Label htmlFor="validityDate" className="text-foreground">Date de validité *</Label>
          <Input
            id="validityDate"
            type="date"
            {...form.register("validityDate")}
            className="bg-muted border-border text-foreground"
          />
          {form.formState.errors.validityDate && (
            <p className="text-sm text-red-400">{form.formState.errors.validityDate.message}</p>
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

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-foreground">Notes</Label>
        <Textarea
          id="notes"
          {...form.register("notes")}
          className="bg-muted border-border text-foreground"
          rows={3}
          placeholder="Notes ou commentaires pour ce devis..."
        />
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-2">
        <Label htmlFor="termsConditions" className="text-foreground">Conditions générales</Label>
        <Textarea
          id="termsConditions"
          {...form.register("termsConditions")}
          className="bg-muted border-border text-foreground"
          rows={4}
          placeholder="Conditions générales de vente..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="border-border">
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={quote ? updateMutation.isPending : createMutation.isPending} 
          className="bg-primary hover:bg-primary/90"
        >
          {quote 
            ? (updateMutation.isPending ? "Mise à jour..." : "Mettre à jour") 
            : (createMutation.isPending ? "Création..." : "Créer le devis")
          }
        </Button>
      </div>
    </form>
  );
}
