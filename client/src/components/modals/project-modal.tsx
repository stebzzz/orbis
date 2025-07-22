import { useState } from "react";
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
import type { Project, Client } from "@shared/schema";

const projectFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  clientId: z.number({ required_error: "Veuillez sélectionner un client" }),
  hourlyRate: z.number().min(0, "Le taux horaire doit être positif"),
  estimatedHours: z.number().min(0, "Les heures estimées doivent être positives").optional(),
  status: z.enum(["planning", "en_cours", "termine", "suspendu"]),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
}

export function ProjectModal({ open, onOpenChange, project }: ProjectModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!project;

  // Mock clients data
  const clients: Client[] = [
    {
      id: 1,
      userId: "user1",
      type: "professionnel",
      companyName: "TechCorp SARL",
      email: "contact@techcorp.fr",
      phone: "01 23 45 67 89",
      address: "123 Rue de la Tech",
      city: "Paris",
      postalCode: "75001",
      country: "France",
      siret: "12345678901234",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15")
    },
    {
      id: 2,
      userId: "user1",
      type: "particulier",
      firstName: "Marie",
      lastName: "Dupont",
      email: "marie.dupont@email.fr",
      phone: "06 12 34 56 78",
      address: "456 Avenue des Particuliers",
      city: "Lyon",
      postalCode: "69000",
      country: "France",
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-01")
    }
  ];

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      clientId: project?.clientId || undefined,
      hourlyRate: project?.hourlyRate || 0,
      estimatedHours: project?.estimatedHours || 0,
      status: project?.status || "planning",
    },
  });

  const handleProjectSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock project creation/update
      console.log(isEditing ? 'Updating project:' : 'Creating project:', data);
      
      toast({
        title: "Succès",
        description: isEditing ? "Projet modifié avec succès" : "Projet créé avec succès",
      });
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: ProjectFormData) => {
    handleProjectSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le projet" : "Nouveau projet"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifiez les informations du projet ci-dessous." : "Créez un nouveau projet en remplissant les informations ci-dessous."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du projet *</FormLabel>
                  <FormControl>
                    <Input placeholder="Site web e-commerce..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client *</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.type === 'professionnel' ? client.companyName : `${client.firstName} ${client.lastName}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taux horaire (€) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50"
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
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heures estimées</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="40"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="planning">En planification</SelectItem>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="termine">Terminé</SelectItem>
                      <SelectItem value="suspendu">Suspendu</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description détaillée du projet..." {...field} />
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