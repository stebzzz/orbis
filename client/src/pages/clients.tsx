import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Eye, Building2, User, Mail, Phone, MapPin, Sparkles, Users, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientModal } from "@/components/modals/client-modal";
import { clientsService } from "@/lib/firebase-service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Client } from "@shared/schema";

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    
    const loadClients = async () => {
      try {
        const clientsData = await clientsService.getAll(user.id);
        setClients(clientsData);
      } catch (error) {
        console.error('Error loading clients:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les clients",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, [toast, user]);

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      await clientsService.delete(id);
    },
    onSuccess: () => {
      // Reload clients after deletion
      const loadClients = async () => {
        if (!user?.id) return;
        try {
          const clientsData = await clientsService.getAll(user.id);
          setClients(clientsData);
        } catch (error) {
          console.error('Error reloading clients:', error);
        }
      };
      loadClients();
      toast({
        title: "Succès",
        description: "Client supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    const name = client.type === 'particulier' 
      ? `${client.firstName || ''} ${client.lastName || ''}`.trim()
      : client.companyName || '';
    return (
      name.toLowerCase().includes(searchLower) ||
      (client.email || '').toLowerCase().includes(searchLower) ||
      (client.companyName || '').toLowerCase().includes(searchLower)
    );
  });

  const particuliers = filteredClients.filter(c => c.type === 'particulier');
  const professionnels = filteredClients.filter(c => c.type === 'professionnel');

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      deleteClientMutation.mutate(id);
    }
  };

  const handleNewClient = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleModalClose = async (open: boolean) => {
    setIsModalOpen(open);
    if (!open && user?.id) {
      // Reload clients when modal closes (in case a client was created/updated)
      try {
        const clientsData = await clientsService.getAll(user.id);
        setClients(clientsData);
      } catch (error) {
        console.error('Error reloading clients:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto bg-gradient-to-br from-background via-muted/5 to-primary/5">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center justify-center min-h-screen"
          >
            <div className="relative">
              {/* Cercle de chargement principal */}
              <motion.div
                className="w-20 h-20 border-4 border-border rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{
                  borderTopColor: "hsl(var(--primary))",
                  borderRightColor: "hsl(var(--secondary))"
                }}
              />
              
              {/* Icône centrale */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut"
                }}
              >
                <Users className="w-8 h-8 text-primary" />
              </motion.div>
              
              {/* Particules flottantes */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full"
                  style={{
                    top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 40}px`,
                    left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 40}px`
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            
            <motion.p
              className="absolute mt-32 text-lg font-medium text-muted-foreground"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Chargement des clients...
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-background via-muted/5 to-primary/5 relative">
      {/* Effet de fond animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-secondary/10 to-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Header avec animation d'entrée */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className="relative z-10"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 blur-xl" />
          <Header
            title="Clients"
            subtitle={`${clients.length} client${clients.length > 1 ? 's' : ''} enregistré${clients.length > 1 ? 's' : ''}`}
            action={
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Button 
                  onClick={handleNewClient} 
                  className="relative overflow-hidden bg-gradient-to-r from-primary via-primary to-secondary hover:from-primary/90 hover:via-primary/90 hover:to-secondary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 border-0 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Client
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 ml-2 opacity-70" />
                  </motion.div>
                </Button>
              </motion.div>
            }
          />
        </div>
      </motion.div>

      {/* Contenu principal */}
      <motion.div 
        className="relative z-10 p-6 space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Barre de recherche moderne */}
        <motion.div 
          className="relative max-w-md group"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Effet de lueur de fond */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          
          {/* Bordure animée */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--secondary) / 0.3))",
              padding: "1px"
            }}
            animate={{
              background: [
                "linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--secondary) / 0.3))",
                "linear-gradient(225deg, hsl(var(--secondary) / 0.3), hsl(var(--primary) / 0.3))",
                "linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--secondary) / 0.3))"
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="w-full h-full bg-card/80 backdrop-blur-sm rounded-2xl" />
          </motion.div>
          
          <div className="relative">
            <motion.div
              className="absolute left-4 top-1/2 transform -translate-y-1/2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Search className="text-primary w-5 h-5" />
            </motion.div>
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition-all duration-300 rounded-2xl"
            />
          </div>
        </motion.div>

        {/* Onglets clients modernes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative group"
        >
          {/* Effet de lueur de fond */}
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 via-primary/5 to-accent/10 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          
          <Tabs defaultValue="tous" className="w-full relative">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <TabsList className="relative bg-card/80 backdrop-blur-sm border border-border/50 p-1 rounded-2xl shadow-lg">
                <TabsTrigger 
                  value="tous" 
                  className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 rounded-xl px-6 py-3 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300" />
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Users className="w-4 h-4 mr-2" />
                  </motion.div>
                  Tous ({filteredClients.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="particuliers" 
                  className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-accent data-[state=active]:text-secondary-foreground data-[state=active]:shadow-lg transition-all duration-300 rounded-xl px-6 py-3 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300" />
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <User className="w-4 h-4 mr-2" />
                  </motion.div>
                  Particuliers ({particuliers.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="professionnels" 
                  className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg transition-all duration-300 rounded-xl px-6 py-3 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300" />
                  <motion.div
                    animate={{ 
                      y: [0, -2, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                  </motion.div>
                  Professionnels ({professionnels.length})
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="tous" className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <ClientGrid 
                  clients={filteredClients} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete}
                  isDeleting={deleteClientMutation.isPending}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="particuliers" className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <ClientGrid 
                  clients={particuliers} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete}
                  isDeleting={deleteClientMutation.isPending}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="professionnels" className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <ClientGrid 
                  clients={professionnels} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete}
                  isDeleting={deleteClientMutation.isPending}
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      {/* Client Modal */}
      <ClientModal 
        open={isModalOpen}
        onOpenChange={handleModalClose}
        client={selectedClient || undefined}
      />
    </div>
  );
}

interface ClientGridProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function ClientGrid({ clients, onEdit, onDelete, isDeleting }: ClientGridProps) {
  if (clients.length === 0) {
    return (
      <motion.div 
        className="text-center py-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-2xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-xl"
            animate={{
              x: [0, -25, 0],
              y: [0, 15, 0],
              scale: [1, 0.8, 1]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10"
        >
          <div className="relative glass rounded-3xl p-16 border border-border/30 max-w-lg mx-auto backdrop-blur-sm shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-3xl" />
            <div className="relative">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="mb-6"
              >
                <UserCheck className="w-16 h-16 text-primary mx-auto" />
              </motion.div>
              <motion.h3 
                className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Aucun client trouvé
              </motion.h3>
              <motion.p 
                className="text-muted-foreground text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Commencez par ajouter votre premier client
              </motion.p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <AnimatePresence mode="popLayout">
        {clients.map((client, index) => (
          <motion.div 
            key={client.id}
            layout
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ 
              opacity: 0, 
              y: -30, 
              scale: 0.8,
              transition: { duration: 0.3 }
            }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.08,
              type: "spring",
              stiffness: 120,
              damping: 20
            }}
            whileHover={{ 
              y: -12,
              scale: 1.02,
              transition: { duration: 0.3, type: "spring", stiffness: 300 } 
            }}
            whileTap={{ scale: 0.98 }}
            className="group relative"
          >
            {/* Enhanced glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-700" />
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Card */}
            <Card className="relative glass border border-border/30 hover:border-primary/40 transition-all duration-500 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-card/80 via-card/60 to-card/80 rounded-3xl" />
              <CardHeader className="relative pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <motion.div 
                      className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 border border-border/20 shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                      {client.type === 'particulier' ? 
                        <User className="relative w-6 h-6 text-primary" /> : 
                        <Building2 className="relative w-6 h-6 text-primary" />
                      }
                    </motion.div>
                    <div className="flex-1">
                      <CardTitle className="text-foreground text-xl font-bold leading-tight mb-3">
                        {client.type === 'particulier' 
                          ? `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Nom non défini'
                          : client.companyName || 'Nom non défini'
                        }
                      </CardTitle>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge 
                          variant={client.type === 'professionnel' ? 'default' : 'secondary'}
                          className={`relative overflow-hidden ${
                            client.type === 'professionnel' 
                              ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground border-primary/20' 
                              : 'bg-gradient-to-r from-secondary to-accent text-secondary-foreground border-secondary/20'
                          } shadow-md`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                          <span className="relative">
                            {client.type === 'professionnel' ? 'Professionnel' : 'Particulier'}
                          </span>
                        </Badge>
                      </motion.div>
                    </div>
                  </div>
                  
                  <motion.div 
                    className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    initial={{ x: 20 }}
                    animate={{ x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(client)}
                        className="h-10 w-10 p-0 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <Edit className="w-4 h-4 text-primary" />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(client.id.toString())}
                        disabled={isDeleting}
                        className="h-10 w-10 p-0 rounded-xl bg-gradient-to-r from-destructive/10 to-red-500/10 hover:from-destructive/20 hover:to-red-500/20 border border-destructive/20 hover:border-destructive/40 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4">
                  {client.email && (
                    <motion.div 
                      className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-card/50 to-card/30 border border-border/20 backdrop-blur-sm"
                      whileHover={{ scale: 1.02, x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10">
                        <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                      </div>
                      <span className="text-foreground font-medium truncate">{client.email}</span>
                    </motion.div>
                  )}
                  {client.phone && (
                    <motion.div 
                      className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-card/50 to-card/30 border border-border/20 backdrop-blur-sm"
                      whileHover={{ scale: 1.02, x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-br from-secondary/10 to-accent/10">
                        <Phone className="w-4 h-4 text-secondary flex-shrink-0" />
                      </div>
                      <span className="text-foreground font-medium">{client.phone}</span>
                    </motion.div>
                  )}
                  {client.address && (
                    <motion.div 
                      className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-card/50 to-card/30 border border-border/20 backdrop-blur-sm"
                      whileHover={{ scale: 1.02, x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-br from-accent/10 to-primary/10">
                        <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                      </div>
                      <span className="text-foreground font-medium">{client.address}</span>
                    </motion.div>
                  )}
                  {client.type === 'professionnel' && client.companyName && (
                    <motion.div 
                      className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-card/50 to-card/30 border border-border/20 backdrop-blur-sm"
                      whileHover={{ scale: 1.02, x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10">
                        <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                      </div>
                      <span className="text-foreground font-medium">{client.companyName}</span>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
