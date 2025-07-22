import { useState } from "react";
import { Plus, Play, Pause, CheckCircle, Clock, Calendar, User, Edit, Sparkles, Target, TrendingUp, BarChart3, Zap, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectModal } from "@/components/modals/project-modal";
import { useToast } from "@/hooks/use-toast";
import type { Project, Client } from "@shared/schema";

type ProjectStatus = 'planning' | 'en_cours' | 'termine' | 'suspendu';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      type: "spring",
      stiffness: 120,
      damping: 20
    }
  }
};

const loadingVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      type: "spring",
      stiffness: 100
    }
  }
};

export default function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock data for projects
  const projects: Project[] = [
    {
      id: "1",
      name: "Site Web E-commerce",
      description: "Développement d'une plateforme e-commerce moderne",
      clientId: "1",
      status: "en_cours" as ProjectStatus,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-02-01"),
      budget: 15000,
      hourlyRate: 75,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date().toISOString()
    },
    {
      id: "2",
      name: "Application Mobile",
      description: "App mobile pour la gestion des commandes",
      clientId: "2",
      status: "planning" as ProjectStatus,
      startDate: new Date("2024-01-08"),
      endDate: new Date("2024-03-08"),
      budget: 25000,
      hourlyRate: 80,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      createdAt: new Date().toISOString()
    }
  ];

  // Mock data for clients
  const clients: Client[] = [
    {
      id: "1",
      type: "professionnel",
      companyName: "TechCorp SARL",
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean.dupont@techcorp.fr",
      phone: "+33 1 23 45 67 89",
      address: "123 Rue de la Tech",
      city: "Paris",
      postalCode: "75001",
      country: "France",
      createdAt: new Date().toISOString()
    },
    {
      id: "2",
      type: "particulier",
      firstName: "Marie",
      lastName: "Martin",
      email: "marie.martin@email.fr",
      phone: "+33 6 12 34 56 78",
      address: "456 Avenue des Fleurs",
      city: "Lyon",
      postalCode: "69000",
      country: "France",
      createdAt: new Date().toISOString()
    }
  ];

  // Mock function to update project status
  const updateProjectStatus = async ({ id, status }: { id: string; status: ProjectStatus }) => {
    // In a real app, this would update the project in Firebase
    console.log(`Updating project ${id} to status ${status}`);
    toast({
      title: "Succès",
      description: "Statut du projet mis à jour",
    });
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const statusConfig = {
      planning: { 
        label: 'Planification', 
        className: 'bg-gradient-to-r from-secondary/20 to-accent/20 text-secondary border-secondary/30 shadow-md' 
      },
      en_cours: { 
        label: 'En cours', 
        className: 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border-primary/30 shadow-md' 
      },
      termine: { 
        label: 'Terminé', 
        className: 'bg-gradient-to-r from-accent/20 to-primary/20 text-accent border-accent/30 shadow-md' 
      },
      suspendu: { 
        label: 'Suspendu', 
        className: 'bg-gradient-to-r from-destructive/20 to-red-500/20 text-destructive border-destructive/30 shadow-md' 
      },
    };

    const config = statusConfig[status] || { 
      label: status, 
      className: 'bg-gradient-to-r from-muted/20 to-muted-foreground/20 text-muted-foreground border-muted/30' 
    };
    
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <Badge className={`relative overflow-hidden ${config.className}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
          <span className="relative">{config.label}</span>
        </Badge>
      </motion.div>
    );
  };

  const getClientName = (clientId: string | null | undefined) => {
    if (!clientId) return "Client non assigné";
    const client = clients.find(c => c.id === clientId);
    if (!client) return "Client inconnu";
    return client.type === 'professionnel' 
      ? client.companyName || 'Société sans nom'
      : `${client.firstName} ${client.lastName}`;
  };

  const calculateProgress = (project: Project) => {
    switch (project.status) {
      case 'planning': return 10;
      case 'en_cours': return 50;
      case 'termine': return 100;
      case 'suspendu': return 25;
      default: return 0;
    }
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleNewProject = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const handleStatusChange = (project: Project, newStatus: ProjectStatus) => {
    updateProjectStatus({ id: project.id, status: newStatus });
  };

  const activeProjects = projects.filter(p => p.status === 'en_cours');
  const planningProjects = projects.filter(p => p.status === 'planning');
  const completedProjects = projects.filter(p => p.status === 'termine');

  // Loading state
  if (isLoading) {
    return (
      <motion.div 
        className="flex-1 overflow-auto flex items-center justify-center min-h-screen"
        variants={loadingVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-3/4 right-1/4 w-32 h-32 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-2xl"
            animate={{
              x: [0, -40, 0],
              y: [0, 25, 0],
              scale: [1, 0.8, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        <div className="relative z-10 text-center">
          <motion.div
            className="relative mb-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full" />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <BarChart3 className="w-8 h-8 text-primary" />
            </motion.div>
          </motion.div>
          
          <motion.h2 
            className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Chargement des projets...
          </motion.h2>
          
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
              style={{
                left: `${20 + i * 10}%`,
                top: `${30 + (i % 2) * 20}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="flex-1 overflow-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-48 h-48 bg-gradient-to-r from-accent/5 to-primary/5 rounded-full blur-2xl"
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
      </div>

      <motion.div variants={itemVariants}>
        <Header
          title="Projets"
          subtitle={`${projects.length} projet${projects.length > 1 ? 's' : ''} • ${activeProjects.length} en cours`}
          action={
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Button 
                onClick={handleNewProject} 
                className="relative bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl hover:shadow-2xl transition-all duration-300 border-0 group"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                </motion.div>
                Nouveau Projet
              </Button>
            </motion.div>
          }
        />
      </motion.div>

      <motion.div 
        className="p-6 space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Enhanced Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          variants={itemVariants}
        >
          {[
            {
              title: "En planification",
              value: planningProjects.length,
              icon: Clock,
              gradient: "from-primary to-primary/80",
              bgGradient: "from-primary/5 to-primary/10",
              glowColor: "primary/30"
            },
            {
              title: "En cours",
              value: activeProjects.length,
              icon: Zap,
              gradient: "from-secondary to-secondary/80",
              bgGradient: "from-secondary/5 to-secondary/10",
              glowColor: "secondary/30"
            },
            {
              title: "Terminés",
              value: completedProjects.length,
              icon: CheckCircle,
              gradient: "from-accent to-accent/80",
              bgGradient: "from-accent/5 to-accent/10",
              glowColor: "accent/30"
            },
            {
              title: "Clients actifs",
              value: new Set(activeProjects.map(p => p.clientId).filter(Boolean)).size,
              icon: Users,
              gradient: "from-primary to-secondary",
              bgGradient: "from-primary/5 to-secondary/5",
              glowColor: "primary/20"
            }
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.title}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                className="group relative"
              >
                {/* Multiple glow layers */}
                <div className={`absolute -inset-1 bg-gradient-to-r from-${stat.glowColor} to-transparent rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500`} />
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
                
                <Card className={`relative bg-gradient-to-br ${stat.bgGradient} backdrop-blur-sm border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <motion.div
                          whileHover={{ 
                            rotate: 360,
                            scale: 1.1
                          }}
                          transition={{ duration: 0.6 }}
                          className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl`}
                        >
                          <IconComponent className="w-7 h-7 text-white" />
                        </motion.div>
                        <div>
                          <motion.p 
                            className="text-sm text-muted-foreground font-medium"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            {stat.title}
                          </motion.p>
                          <motion.p 
                            className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mt-1`}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 * index, type: "spring", stiffness: 200 }}
                          >
                            {stat.value}
                          </motion.p>
                        </div>
                      </div>
                      <TrendingUp className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors duration-300" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Enhanced Projects Grid */}
        {projects.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="text-center py-16"
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="relative inline-block">
              {/* Multiple glow layers */}
              <div className="absolute -inset-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-2xl opacity-60" />
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl opacity-80" />
              
              <motion.div 
                className="relative bg-gradient-to-br from-background/90 to-muted/60 backdrop-blur-sm border border-white/10 rounded-3xl p-12 shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <Target className="w-20 h-20 text-primary mx-auto mb-6" />
                </motion.div>
                <motion.h3 
                  className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Aucun projet
                </motion.h3>
                <motion.p 
                  className="text-muted-foreground mb-8 text-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Commencez par créer votre premier projet
                </motion.p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button 
                    onClick={handleNewProject}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-3 text-lg"
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5 mr-3" />
                    </motion.div>
                    Créer un projet
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={itemVariants}
          >
            <AnimatePresence mode="popLayout">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  variants={itemVariants}
                  whileHover={{ 
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.2 } 
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative"
                >
                  {/* Multiple glow layers */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-xl blur opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
                   
                   {/* Card */}
                   <Card className="relative bg-gradient-to-br from-background/90 to-muted/60 backdrop-blur-sm border border-white/10 hover:border-primary/30 transition-all duration-300 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl">
                     <CardHeader className="pb-4">
                       <div className="flex items-start justify-between">
                         <div className="flex-1">
                           <motion.div 
                             className="flex items-center space-x-3 mb-3"
                             initial={{ opacity: 0, x: -10 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: 0.1 * index }}
                           >
                             <motion.div 
                               className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 shadow-lg"
                               whileHover={{ scale: 1.1, rotate: 5 }}
                               transition={{ duration: 0.2 }}
                             >
                               <Target className="w-5 h-5 text-primary" />
                             </motion.div>
                             <div className="flex-1">
                               <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-lg leading-tight font-bold">{project.name}</CardTitle>
                               <motion.p 
                                 className="text-sm text-muted-foreground mt-1 px-2 py-1 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg backdrop-blur-sm inline-block"
                                 whileHover={{ scale: 1.05 }}
                               >
                                 {getClientName(project.clientId)}
                               </motion.p>
                             </div>
                           </motion.div>
                           <motion.div 
                             className="flex items-center space-x-2"
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: 0.2 * index }}
                           >
                             {getStatusBadge(project.status)}
                           </motion.div>
                         </div>
                         <motion.div
                           whileHover={{ scale: 1.1, rotate: 5 }}
                           whileTap={{ scale: 0.9 }}
                           className="relative"
                         >
                           <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                           <Button
                             size="sm"
                             variant="ghost"
                             onClick={() => handleEditProject(project)}
                             className="relative h-8 w-8 p-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-muted/50 to-muted/30 hover:from-primary/20 hover:to-secondary/20 hover:text-primary transition-all duration-300 backdrop-blur-sm"
                           >
                             <Edit className="w-4 h-4" />
                           </Button>
                         </motion.div>
                       </div>
                     </CardHeader>
                     <CardContent className="pt-0">
                       <div className="space-y-5">
                         {project.description && (
                           <motion.p 
                             className="text-sm text-muted-foreground line-clamp-2 leading-relaxed p-3 bg-gradient-to-r from-muted/30 to-muted/20 rounded-lg backdrop-blur-sm border border-white/5"
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: 0.3 * index }}
                           >
                             {project.description}
                           </motion.p>
                         )}
                         
                         <motion.div 
                           className="space-y-3"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 0.4 * index }}
                         >
                           <div className="flex justify-between items-center text-sm">
                             <span className="text-muted-foreground font-medium">Progression</span>
                             <motion.span 
                               className="text-foreground font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                               animate={{ scale: [1, 1.1, 1] }}
                               transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                             >
                               {calculateProgress(project)}%
                             </motion.span>
                           </div>
                           <div className="relative">
                             <div className="w-full bg-gradient-to-r from-muted/50 to-muted/30 rounded-full h-3 backdrop-blur-sm border border-white/10">
                               <motion.div
                                 className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full shadow-lg"
                                 initial={{ width: 0 }}
                                 animate={{ width: `${calculateProgress(project)}%` }}
                                 transition={{ duration: 1.5, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                               />
                             </div>
                             <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-sm" />
                           </div>
                         </motion.div>

                         <motion.div 
                           className="grid grid-cols-1 gap-3 text-sm"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 0.6 * index }}
                         >
                           {project.hourlyRate && (
                             <motion.div 
                               className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 backdrop-blur-sm shadow-lg"
                               whileHover={{ scale: 1.02, y: -2 }}
                               transition={{ duration: 0.2 }}
                             >
                               <span className="text-muted-foreground">Taux horaire</span>
                               <span className="text-foreground font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
                                 {Number(project.hourlyRate).toLocaleString('fr-FR', {
                                   style: 'currency',
                                   currency: 'EUR'
                                 })}/h
                               </span>
                             </motion.div>
                           )}

                           {project.deadline && (
                             <motion.div 
                               className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 backdrop-blur-sm shadow-lg"
                               whileHover={{ scale: 1.02, y: -2 }}
                               transition={{ duration: 0.2 }}
                             >
                               <span className="text-muted-foreground">Échéance</span>
                               <span className="text-foreground font-semibold">
                                 {new Date(project.deadline).toLocaleDateString('fr-FR')}
                               </span>
                             </motion.div>
                           )}
                         </motion.div>

                          {/* Enhanced Quick Status Actions */}
                          <motion.div 
                            className="flex flex-wrap gap-2 pt-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 * index }}
                          >
                            {project.status === 'planning' && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative flex-1"
                              >
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-lg blur opacity-0 hover:opacity-100 transition-opacity duration-300" />
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusChange(project, 'en_cours')}
                                  className="relative w-full h-8 text-xs bg-gradient-to-r from-blue-500/80 to-cyan-500/80 hover:from-blue-500/90 hover:to-cyan-500/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  >
                                    <Play className="w-3 h-3 mr-1" />
                                  </motion.div>
                                  Démarrer
                                </Button>
                              </motion.div>
                            )}
                            {project.status === 'en_cours' && (
                              <>
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3, delay: 0.1 }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="relative flex-1"
                                >
                                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-lg blur opacity-0 hover:opacity-100 transition-opacity duration-300" />
                                  <Button
                                    size="sm"
                                    onClick={() => handleStatusChange(project, 'suspendu')}
                                    className="relative w-full h-8 text-xs bg-gradient-to-r from-yellow-500/80 to-orange-500/80 hover:from-yellow-500/90 hover:to-orange-500/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                                  >
                                    <Pause className="w-3 h-3 mr-1" />
                                    Suspendre
                                  </Button>
                                </motion.div>
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3, delay: 0.2 }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="relative flex-1"
                                >
                                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-lg blur opacity-0 hover:opacity-100 transition-opacity duration-300" />
                                  <Button
                                    size="sm"
                                    onClick={() => handleStatusChange(project, 'termine')}
                                    className="relative w-full h-8 text-xs bg-gradient-to-r from-green-500/80 to-emerald-500/80 hover:from-green-500/90 hover:to-emerald-500/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Terminer
                                  </Button>
                                </motion.div>
                              </>
                            )}
                            {project.status === 'suspendu' && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative flex-1"
                              >
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-lg blur opacity-0 hover:opacity-100 transition-opacity duration-300" />
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusChange(project, 'en_cours')}
                                  className="relative w-full h-8 text-xs bg-gradient-to-r from-blue-500/80 to-cyan-500/80 hover:from-blue-500/90 hover:to-cyan-500/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  >
                                    <Play className="w-3 h-3 mr-1" />
                                  </motion.div>
                                  Reprendre
                                </Button>
                              </motion.div>
                            )}
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>

        {/* Project Modal */}
        <ProjectModal 
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          project={selectedProject || undefined}
        />
      </motion.div>
    );
  }