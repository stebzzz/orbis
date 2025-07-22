import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, MoreHorizontal, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { quotesService, invoicesService, clientsService } from "@/lib/firebase-service";
import type { Quote, Invoice, Client, DocumentStatus } from "@/lib/types";

export default function RecentDocuments() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        const [quotesData, invoicesData, clientsData] = await Promise.all([
          quotesService.getAll(),
          invoicesService.getAll(),
          clientsService.getAll()
        ]);
        setQuotes(quotesData);
        setInvoices(invoicesData);
        setClients(clientsData);
      } catch (error) {
        console.error('Erreur lors du chargement des documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, []);

  // Combine and sort documents by creation date
  const allDocuments = [
    ...quotes.map(q => ({ ...q, type: 'quote' as const })),
    ...invoices.map(i => ({ ...i, type: 'invoice' as const })),
  ].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
   .slice(0, 5);

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return "Client inconnu";
    return client.type === 'professionnel' 
      ? client.companyName || 'Société sans nom'
      : `${client.firstName} ${client.lastName}`;
  };

  const getClientEmail = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client?.email || "";
  };

  const getStatusBadge = (status: DocumentStatus) => {
    const statusConfig = {
      brouillon: { label: 'Brouillon', className: 'bg-muted text-muted-foreground' },
      envoye: { label: 'Envoyé', className: 'bg-blue-500/20 text-blue-400' },
      accepte: { label: 'Accepté', className: 'bg-secondary/20 text-secondary' },
      refuse: { label: 'Refusé', className: 'bg-red-500/20 text-red-400' },
      paye: { label: 'Payé', className: 'bg-secondary/20 text-secondary' },
      en_retard: { label: 'En retard', className: 'bg-red-500/20 text-red-400' },
      expire: { label: 'Expiré', className: 'bg-red-500/20 text-red-400' },
      annule: { label: 'Annulé', className: 'bg-muted text-muted-foreground' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Documents Récents</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            Voir tous
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-sm font-medium text-muted-foreground pb-3">Document</th>
                  <th className="text-left text-sm font-medium text-muted-foreground pb-3">Client</th>
                  <th className="text-left text-sm font-medium text-muted-foreground pb-3">Montant</th>
                  <th className="text-left text-sm font-medium text-muted-foreground pb-3">Statut</th>
                  <th className="text-left text-sm font-medium text-muted-foreground pb-3">Date</th>
                  <th className="text-right text-sm font-medium text-muted-foreground pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-muted animate-pulse"></div>
                        <div>
                          <div className="h-4 bg-muted rounded w-20 mb-1 animate-pulse"></div>
                          <div className="h-3 bg-muted rounded w-12 animate-pulse"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="h-4 bg-muted rounded w-24 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-muted rounded w-32 animate-pulse"></div>
                    </td>
                    <td className="py-3">
                      <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                    </td>
                    <td className="py-3">
                      <div className="h-6 bg-muted rounded w-16 animate-pulse"></div>
                    </td>
                    <td className="py-3">
                      <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
                        <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : allDocuments.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Aucun document récent</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-sm font-medium text-muted-foreground pb-3">Document</th>
                  <th className="text-left text-sm font-medium text-muted-foreground pb-3">Client</th>
                  <th className="text-left text-sm font-medium text-muted-foreground pb-3">Montant</th>
                  <th className="text-left text-sm font-medium text-muted-foreground pb-3">Statut</th>
                  <th className="text-left text-sm font-medium text-muted-foreground pb-3">Date</th>
                  <th className="text-right text-sm font-medium text-muted-foreground pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allDocuments.map((doc) => (
                  <tr key={`${doc.type}-${doc.id}`} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          doc.type === 'quote' ? 'bg-accent/20' : 'bg-primary/20'
                        }`}>
                          <FileText className={`w-4 h-4 ${
                            doc.type === 'quote' ? 'text-accent' : 'text-primary'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{doc.number}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.type === 'quote' ? 'Devis' : 'Facture'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <p className="text-sm text-foreground">{getClientName(doc.clientId)}</p>
                      <p className="text-xs text-muted-foreground">{getClientEmail(doc.clientId)}</p>
                    </td>
                    <td className="py-3">
                      <p className="text-sm font-medium text-foreground">
                        {Number((doc as any).total || 0).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </p>
                    </td>
                    <td className="py-3">
                      {getStatusBadge(doc.status as DocumentStatus)}
                    </td>
                    <td className="py-3">
                      <p className="text-sm text-muted-foreground">
                        {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                      </p>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                          <Download className="w-4 h-4" />
                        </Button>
                        {doc.type === 'quote' && doc.status === 'accepte' && (
                          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <ArrowRight className="w-3 h-3 mr-1" />
                            Convertir
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
