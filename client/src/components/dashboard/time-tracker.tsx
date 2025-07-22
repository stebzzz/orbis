import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Clock } from "lucide-react";
import { projectsService, timeEntriesService } from "@/lib/firebase-service";
import type { TimeEntry, Project } from "@/lib/types";

export default function TimeTracker() {
  const [elapsed, setElapsed] = useState(0);
  const [activeTimeEntry, setActiveTimeEntry] = useState<TimeEntry | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [projectsData, activeEntry] = await Promise.all([
          projectsService.getAll(),
          timeEntriesService.getActiveEntry()
        ]);
        setProjects(projectsData);
        if (activeEntry) {
          setActiveTimeEntry(activeEntry);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const startTimer = async (projectId: string) => {
    try {
      const newTimeEntry: Omit<TimeEntry, 'id'> = {
        projectId,
        taskId: null,
        description: "Temps de travail",
        startTime: new Date().toISOString(),
        endTime: null,
        duration: 0,
        isRunning: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const createdEntry = await timeEntriesService.create(newTimeEntry);
      setActiveTimeEntry(createdEntry);
    } catch (error) {
      console.error('Erreur lors du démarrage du minuteur:', error);
    }
  };

  const stopTimer = async () => {
    if (activeTimeEntry) {
      try {
        const updatedEntry = {
          ...activeTimeEntry,
          endTime: new Date().toISOString(),
          duration: elapsed,
          isRunning: false,
          updatedAt: new Date().toISOString()
        };
        await timeEntriesService.update(activeTimeEntry.id, updatedEntry);
        setActiveTimeEntry(null);
        setElapsed(0);
      } catch (error) {
        console.error('Erreur lors de l\'arrêt du minuteur:', error);
      }
    }
  };

  // Update elapsed time for active timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeTimeEntry && activeTimeEntry.isRunning && activeTimeEntry.startTime) {
      interval = setInterval(() => {
        const start = new Date(activeTimeEntry.startTime!).getTime();
        const now = new Date().getTime();
        const diff = Math.floor((now - start) / 1000);
        setElapsed(diff);
      }, 1000);
    } else {
      setElapsed(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimeEntry]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return "Tâche générale";
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "Projet inconnu";
  };

  const recentProjects = projects.filter(p => p.status === 'en_cours').slice(0, 3);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Suivi du Temps</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Active Timer */}
        {activeTimeEntry && activeTimeEntry.isRunning ? (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-primary font-medium">Minuteur Actif</span>
              <Badge className="bg-primary/20 text-primary border-primary/20">
                En cours
              </Badge>
            </div>
            <h4 className="font-medium text-foreground mb-1">
              {getProjectName(activeTimeEntry.projectId)}
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              {activeTimeEntry.description || "Temps de travail"}
            </p>
            
            {/* Timer Display */}
            <div className="text-center mb-4">
              <div className="text-3xl font-mono font-bold text-foreground">
                {formatTime(elapsed)}
              </div>
              <p className="text-sm text-muted-foreground">Temps écoulé</p>
            </div>
            
            {/* Timer Controls */}
            <div className="flex items-center justify-center space-x-3">
              <Button
                onClick={stopTimer}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Square className="w-4 h-4 mr-2" />
                Arrêter
              </Button>
            </div>
          </div>
        ) : (
          /* No Active Timer */
          <div className="text-center py-8 mb-4">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">Aucun minuteur actif</p>
          </div>
        )}
        
        {/* Quick Start Timer */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Démarrage Rapide</h4>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-border rounded-lg p-3">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground/70 text-center py-4">
              Aucun projet actif disponible
            </p>
          ) : (
            recentProjects.map((project) => (
              <Button
                key={project.id}
                variant="outline"
                className="w-full justify-between border-border hover:border-muted-foreground hover:bg-muted/50"
                onClick={() => startTimer(project.id)}
                disabled={activeTimeEntry?.isRunning && activeTimeEntry.projectId === project.id}
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{project.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {project.description || "Développement"}
                  </p>
                </div>
                <Play className="w-4 h-4 text-primary" />
              </Button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
