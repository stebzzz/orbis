import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { api } from "@/lib/api";
import { insertProjectSchema } from "@shared/schema";
import type { Client, Project } from "@/lib/types";

const projectFormSchema = insertProjectSchema.extend({
  deadline: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  project?: Project | null;
  clients: Client[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProjectForm({ project, clients, onSuccess, onCancel }: ProjectFormProps) {
  const { toast } = useToast();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      status: project?.status || "planning",
      clientId: project?.clientId || undefined,
      hourlyRate: project?.hourlyRate || "",
      estimatedHours: project?.estimatedHours || undefined,
      deadline: project?.deadline ? new Date(project.deadline).toISOString().split('T')[0] : "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const payload = {
        ...data,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
      };
      const response = await api.createProject(payload);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/projects"] });
      toast({
        title: "Projet créé",
        description: "Le projet a été créé avec succès.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le projet.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const payload = {
        ...data,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
      };
      const response = await api.updateProject(project!.id, payload);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/projects"] });
      toast({
        title: "Projet modifié",
        description: "Le projet a été modifié avec succès.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le projet.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    if (project) {
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

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Project Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">Nom du projet *</Label>
        <Input
          id="name"
          {...form.register("name")}
          className="bg-muted border-border text-foreground"
          placeholder="Ex: Site web e-commerce"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-400">{form.formState.errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground">Description</Label>
        <Textarea
          id="description"
          {...form.register("description")}
          className="bg-muted border-border text-foreground"
          rows={3}
          placeholder="Description détaillée du projet..."
        />
      </div>

      {/* Client and Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientId" className="text-foreground">Client</Label>
          <Select
            value={form.watch("clientId")?.toString() || ""}
            onValueChange={(value) => form.setValue("clientId", value ? parseInt(value) : undefined)}
          >
            <SelectTrigger className="bg-muted border-border text-foreground">
              <SelectValue placeholder="Sélectionner un client" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="" className="text-foreground">Aucun client</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id.toString()} className="text-foreground">
                  {getClientName(client)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-foreground">Statut</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(value) => form.setValue("status", value as any)}
          >
            <SelectTrigger className="bg-muted border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="planning" className="text-foreground">Planification</SelectItem>
              <SelectItem value="en_cours" className="text-foreground">En cours</SelectItem>
              <SelectItem value="termine" className="text-foreground">Terminé</SelectItem>
              <SelectItem value="suspendu" className="text-foreground">Suspendu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hourly Rate and Estimated Hours */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hourlyRate" className="text-foreground">Taux horaire (€)</Label>
          <Input
            id="hourlyRate"
            type="number"
            step="0.01"
            min="0"
            {...form.register("hourlyRate")}
            className="bg-muted border-border text-foreground"
            placeholder="Ex: 50.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedHours" className="text-foreground">Heures estimées</Label>
          <Input
            id="estimatedHours"
            type="number"
            min="0"
            {...form.register("estimatedHours", { valueAsNumber: true })}
            className="bg-muted border-border text-foreground"
            placeholder="Ex: 40"
          />
        </div>
      </div>

      {/* Deadline */}
      <div className="space-y-2">
        <Label htmlFor="deadline" className="text-foreground">Date d'échéance</Label>
        <Input
          id="deadline"
          type="date"
          {...form.register("deadline")}
          className="bg-muted border-border text-foreground"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="border-border">
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
          {isSubmitting ? "Enregistrement..." : project ? "Modifier" : "Créer"}
        </Button>
      </div>
    </form>
  );
}
