import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { clientsService } from "@/lib/firebase-service";
import type { Client } from "@shared/schema";

const clientFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  type: z.enum(["particulier", "professionnel"]),
  company: z.string().optional(),
  siret: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

interface ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
}

export function ClientModal({ open, onOpenChange, client }: ClientModalProps) {
  const { toast } = useToast();
  const isEditing = !!client;
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      type: "particulier",
      company: "",
      siret: "",
      address: "",
      notes: "",
    },
  });

  // Reset form when client changes or modal opens
  useEffect(() => {
    if (open) {
      const formValues = {
        name: client ? (client.type === 'particulier' ? `${client.firstName || ''} ${client.lastName || ''}`.trim() : client.companyName || '') : "",
        email: client?.email || "",
        phone: client?.phone || "",
        type: client?.type || "particulier",
        company: client?.companyName || "",
        siret: client?.siret || "",
        address: client?.address || "",
        notes: client?.notes || "",
      };
      form.reset(formValues);
    }
  }, [client, open, form]);

  const handleClientSubmit = async (data: ClientFormData) => {
    setIsLoading(true);
    try {
      const clientData: any = {
        userId: 'current-user', // TODO: Get from auth context
        type: data.type as 'particulier' | 'professionnel',
        email: data.email || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add fields only if they have values to avoid undefined in Firebase
      if (data.type === 'particulier') {
        const nameParts = data.name.split(' ');
        if (nameParts[0]) clientData.firstName = nameParts[0];
        if (nameParts.slice(1).join(' ')) clientData.lastName = nameParts.slice(1).join(' ');
      } else {
        if (data.company || data.name) clientData.companyName = data.company || data.name;
      }

      if (data.phone) clientData.phone = data.phone;
      if (data.address) clientData.address = data.address;
      if (data.siret) clientData.siret = data.siret;
      if (data.notes) clientData.notes = data.notes;

      if (isEditing && client?.id) {
        await clientsService.update(client.id.toString(), { ...clientData, updatedAt: new Date() });
      } else {
        await clientsService.create(clientData);
      }
      
      toast({
        title: "Succès",
        description: isEditing ? "Client modifié avec succès" : "Client créé avec succès",
      });
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: ClientFormData) => {
    handleClientSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le client" : "Nouveau client"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifiez les informations du client ci-dessous." : "Créez un nouveau client en remplissant les informations ci-dessous."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du client" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="particulier">Particulier</SelectItem>
                        <SelectItem value="professionnel">Professionnel</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="client@exemple.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="06 12 34 56 78" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.watch("type") === "professionnel" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entreprise</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'entreprise" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SIRET</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678901234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Adresse complète" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notes sur le client..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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