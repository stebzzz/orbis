import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Expense } from "@shared/schema";

const expenseFormSchema = z.object({
  description: z.string().min(1, "La description est requise"),
  amount: z.number().min(0, "Le montant doit être positif"),
  category: z.string().optional(),
  date: z.string().min(1, "La date est requise"),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface ExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense;
}

export function ExpenseModal({ open, onOpenChange, expense }: ExpenseModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!expense;

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: expense?.description || "",
      amount: expense?.amount || 0,
      category: expense?.category || "",
      date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      const expenseData = {
        ...data,
        date: new Date(data.date),
      };

      if (isEditing) {
        return api.updateExpense(expense.id, expenseData);
      } else {
        return api.createExpense(expenseData);
      }
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: isEditing ? "Dépense modifiée avec succès" : "Dépense créée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/expenses"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la dépense" : "Nouvelle dépense"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifiez les informations de la dépense ci-dessous." : "Créez une nouvelle dépense en remplissant les informations ci-dessous."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Input placeholder="Achat matériel informatique..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant (€) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="129.99"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="materiel">Matériel</SelectItem>
                      <SelectItem value="logiciel">Logiciels</SelectItem>
                      <SelectItem value="formation">Formation</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="restauration">Restauration</SelectItem>
                      <SelectItem value="hebergement">Hébergement</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="bureau">Bureau</SelectItem>
                      <SelectItem value="juridique">Juridique</SelectItem>
                      <SelectItem value="comptabilite">Comptabilité</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />



            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Enregistrement..." : (isEditing ? "Modifier" : "Créer")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}