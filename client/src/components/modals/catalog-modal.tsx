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
import type { CatalogItem } from "@shared/schema";

const catalogItemFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  price: z.number().min(0, "Le prix doit être positif"),
  unit: z.string().min(1, "L'unité est requise"),
  category: z.string().optional(),
});

type CatalogItemFormData = z.infer<typeof catalogItemFormSchema>;

interface CatalogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: CatalogItem;
}

export function CatalogModal({ open, onOpenChange, item }: CatalogModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!item;

  const form = useForm<CatalogItemFormData>({
    resolver: zodResolver(catalogItemFormSchema),
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      price: item?.unitPrice || 0,
      unit: item?.unit || "heure",
      category: item?.category || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CatalogItemFormData) => {
      if (isEditing) {
        return api.updateCatalogItem(item.id, data);
      } else {
        return api.createCatalogItem(data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: isEditing ? "Article modifié avec succès" : "Article créé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/catalog"] });
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

  const onSubmit = (data: CatalogItemFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'article" : "Nouvel article"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifiez les informations de l'article ci-dessous." : "Créez un nouvel article de catalogue en remplissant les informations ci-dessous."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom *</FormLabel>
                  <FormControl>
                    <Input placeholder="Développement web..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description détaillée de la prestation..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix (€) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="50.00"
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
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une unité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="heure">Heure</SelectItem>
                        <SelectItem value="jour">Jour</SelectItem>
                        <SelectItem value="forfait">Forfait</SelectItem>
                        <SelectItem value="piece">Pièce</SelectItem>
                        <SelectItem value="mois">Mois</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <SelectItem value="developpement">Développement</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="formation">Formation</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
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