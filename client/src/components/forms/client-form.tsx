import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { api } from "@/lib/api";
import { insertClientSchema } from "@shared/schema";
import type { Client } from "@/lib/types";

const clientFormSchema = insertClientSchema.extend({
  type: z.enum(["particulier", "professionnel"]),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  client?: Client | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const { toast } = useToast();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      type: client?.type || "professionnel",
      firstName: client?.firstName || "",
      lastName: client?.lastName || "",
      companyName: client?.companyName || "",
      email: client?.email || "",
      phone: client?.phone || "",
      address: client?.address || "",
      city: client?.city || "",
      postalCode: client?.postalCode || "",
      country: client?.country || "France",
      siret: client?.siret || "",
      vatNumber: client?.vatNumber || "",
      notes: client?.notes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await api.createClient(data);
       return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/clients"] });
      toast({
        title: "Client créé",
        description: "Le client a été créé avec succès.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le client.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await api.updateClient(client!.id, data);
       return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/clients"] });
      toast({
        title: "Client modifié",
        description: "Le client a été modifié avec succès.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le client.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ClientFormData) => {
    if (client) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const watchedType = form.watch("type");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Client Type */}
      <div className="space-y-3">
        <Label className="text-foreground">Type de client *</Label>
        <RadioGroup
          value={watchedType}
          onValueChange={(value) => form.setValue("type", value as "particulier" | "professionnel")}
          className="flex space-x-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="particulier" id="particulier" />
            <Label htmlFor="particulier" className="text-foreground">Particulier</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="professionnel" id="professionnel" />
            <Label htmlFor="professionnel" className="text-foreground">Professionnel</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Name Fields */}
      {watchedType === "particulier" ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-foreground">Prénom *</Label>
            <Input
              id="firstName"
              {...form.register("firstName")}
              className="bg-muted border-border text-foreground"
            />
            {form.formState.errors.firstName && (
              <p className="text-sm text-red-400">{form.formState.errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-foreground">Nom *</Label>
            <Input
              id="lastName"
              {...form.register("lastName")}
              className="bg-muted border-border text-foreground"
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-red-400">{form.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-foreground">Nom de l'entreprise *</Label>
          <Input
            id="companyName"
            {...form.register("companyName")}
            className="bg-muted border-border text-foreground"
          />
          {form.formState.errors.companyName && (
            <p className="text-sm text-red-400">{form.formState.errors.companyName.message}</p>
          )}
        </div>
      )}

      {/* Contact Information */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email *</Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            className="bg-muted border-border text-foreground"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-400">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground">Téléphone</Label>
          <Input
            id="phone"
            {...form.register("phone")}
            className="bg-muted border-border text-foreground"
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address" className="text-foreground">Adresse</Label>
          <Textarea
            id="address"
            {...form.register("address")}
            className="bg-muted border-border text-foreground"
            rows={2}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-foreground">Ville</Label>
            <Input
              id="city"
              {...form.register("city")}
              className="bg-muted border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-foreground">Code postal</Label>
            <Input
              id="postalCode"
              {...form.register("postalCode")}
              className="bg-muted border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country" className="text-foreground">Pays</Label>
            <Input
              id="country"
              {...form.register("country")}
              className="bg-muted border-border text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Professional Information */}
      {watchedType === "professionnel" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="siret" className="text-foreground">SIRET</Label>
            <Input
              id="siret"
              {...form.register("siret")}
              className="bg-muted border-border text-foreground font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vatNumber" className="text-foreground">Numéro de TVA</Label>
            <Input
              id="vatNumber"
              {...form.register("vatNumber")}
              className="bg-muted border-border text-foreground font-mono"
            />
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-foreground">Notes</Label>
        <Textarea
          id="notes"
          {...form.register("notes")}
          className="bg-muted border-border text-foreground"
          rows={3}
          placeholder="Notes privées sur ce client..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="border-border">
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
          {isSubmitting ? "Enregistrement..." : client ? "Modifier" : "Créer"}
        </Button>
      </div>
    </form>
  );
}
