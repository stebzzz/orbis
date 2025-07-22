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
  clientId: z.string().optional(),
  hourlyRate: z.number().min(0, "Le taux horaire doit être positif").optional(),
  estimatedHours: z.number().min(0, "Les heures estimées doivent être positives").optional(),
  status: z.enum(["planning", "en_cours", "termine", "suspendu"]),
  deadline: z.date().optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  clients?: Client[];
  onSave?: (project: Partial<Project>) => Promise<void>;
}

export function ProjectModal({ open, onOpenChange, project, clients = [], onSave }: ProjectModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!project;

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      clientId: project?.clientId || undefined,
      hourlyRate: project?.hourlyRate || 0,
      estimatedHours: project?.estimatedHours || 0,
      status: project?.status || "planning",
      deadline: project?.deadline ? new Date(project.deadline) : undefined,
    },
  });

  const handleProjectSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    
    try {
      if (onSave) {
        // Convert form data to Project format
        const projectData: Partial<Project> = {
          ...data,
          id: project?.id,
          // Add any other fields needed
        };
        
        await onSave(projectData);
      } else {
        // Fallback if no onSave provided
        console.log(isEditing ? 'Updating project:' : 'Creating project:', data);
        toast({
          title: "Succès",
          description: isEditing ? "Projet modifié avec succès" : "Projet créé avec succès",
        });
      }
      
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
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value)} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
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

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date limite</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        field.onChange(date);
                      }}
                    />
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