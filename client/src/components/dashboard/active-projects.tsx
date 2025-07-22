import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FolderOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { projectsService, clientsService } from "@/lib/firebase-service";
import type { Project, Client } from "@/lib/types";

export default function ActiveProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [projectsData, clientsData] = await Promise.all([
          projectsService.getAll(),
          clientsService.getAll()
        ]);
        setProjects(projectsData);
        setClients(clientsData);
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const activeProjects = projects.filter(p => 
    p.status === 'en_cours' || p.status === 'planning'
  ).slice(0, 3);

  const getClientName = (clientId: number | string | null) => {
    if (!clientId) return "Client non assigné";
    const client = clients.find(c => c.id === clientId);
    if (!client) return "Client inconnu";
    return client.type === 'professionnel' 
      ? client.companyName || 'Société sans nom'
      : `${client.firstName} ${client.lastName}`;
  };

  const getProgress = (project: Project) => {
    switch (project.status) {
      case 'planning': return 20;
      case 'en_cours': return 65;
      case 'termine': return 100;
      default: return 0;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_cours':
        return <Badge className="bg-secondary/20 text-secondary border-secondary/20">En cours</Badge>;
      case 'planning':
        return <Badge className="bg-accent/20 text-accent border-accent/20">Planning</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Projets en Cours</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            Voir tous
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
                  <div className="h-2 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activeProjects.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Aucun projet actif</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeProjects.map((project) => (
              <div
                key={project.id}
                className="border border-border rounded-lg p-4 hover:border-muted-foreground/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">{project.name}</h4>
                  {getStatusBadge(project.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {getClientName(project.clientId)}
                </p>
                
                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progression</span>
                    <span>{getProgress(project)}%</span>
                  </div>
                  <Progress value={getProgress(project)} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground/70">
                  <span>0h enregistrées</span>
                  {project.deadline && (
                    <span>
                      Échéance: {new Date(project.deadline).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
