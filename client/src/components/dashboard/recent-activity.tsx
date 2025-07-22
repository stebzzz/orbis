import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, TrendingUp, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { invoicesService, quotesService, clientsService } from "@/lib/firebase-service";
import type { Invoice, Quote, Client } from "@/lib/types";

interface Activity {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  time: string;
  icon: any;
  color: string;
  date: Date;
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setIsLoading(true);
        const [invoices, quotes, clients] = await Promise.all([
          invoicesService.getAll(),
          quotesService.getAll(),
          clientsService.getAll()
        ]);

        const recentActivities: Activity[] = [];

        // Ajouter les factures récentes
        invoices.slice(0, 2).forEach(invoice => {
          const client = clients.find(c => c.id === invoice.clientId);
          const clientName = client ? 
            (client.type === 'professionnel' ? client.companyName : `${client.firstName} ${client.lastName}`) 
            : 'Client inconnu';
          
          recentActivities.push({
            id: `invoice-${invoice.id}`,
            type: 'invoice',
            title: `Facture #${invoice.number} créée`,
            subtitle: `Client: ${clientName}`,
            time: getRelativeTime(new Date(invoice.createdAt)),
            icon: FileText,
            color: 'text-primary bg-primary/20',
            date: new Date(invoice.createdAt)
          });
        });

        // Ajouter les devis récents
        quotes.slice(0, 2).forEach(quote => {
          const client = clients.find(c => c.id === quote.clientId);
          const clientName = client ? 
            (client.type === 'professionnel' ? client.companyName : `${client.firstName} ${client.lastName}`) 
            : 'Client inconnu';
          
          recentActivities.push({
            id: `quote-${quote.id}`,
            type: 'quote',
            title: `Devis #${quote.number} ${quote.status === 'accepte' ? 'accepté' : 'créé'}`,
            subtitle: `Client: ${clientName}`,
            time: getRelativeTime(new Date(quote.createdAt)),
            icon: CheckCircle,
            color: 'text-secondary bg-secondary/20',
            date: new Date(quote.createdAt)
          });
        });

        // Ajouter les nouveaux clients
        clients.slice(0, 2).forEach(client => {
          const clientName = client.type === 'professionnel' ? client.companyName : `${client.firstName} ${client.lastName}`;
          
          recentActivities.push({
            id: `client-${client.id}`,
            type: 'client',
            title: 'Nouveau client ajouté',
            subtitle: clientName || 'Client sans nom',
            time: getRelativeTime(new Date(client.createdAt)),
            icon: UserPlus,
            color: 'text-purple-400 bg-purple-500/20',
            date: new Date(client.createdAt)
          });
        });

        // Trier par date et prendre les 4 plus récents
        const sortedActivities = recentActivities
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 4);

        setActivities(sortedActivities);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'activité:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, []);

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure';
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    
    return date.toLocaleDateString('fr-FR');
  };
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Activité Récente</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-muted rounded w-3/4 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-1/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{activity.time}</p>
              </div>
              </div>
            ))}
          </div>
        )}
        
        <Button variant="ghost" className="w-full mt-4 text-primary hover:text-primary/80">
          Voir toute l'activité
        </Button>
      </CardContent>
    </Card>
  );
}
