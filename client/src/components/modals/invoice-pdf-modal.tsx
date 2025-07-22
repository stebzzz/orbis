import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { InvoicePDFViewer, generateInvoicePDF } from '@/components/pdf/invoice-pdf';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { clientsService, lineItemsService } from '@/lib/firebase-service';
import type { Invoice, Client } from '@shared/schema';

interface InvoicePDFModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
}

export function InvoicePDFModal({ open, onOpenChange, invoice }: InvoicePDFModalProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (!open || !invoice) return;
      
      if (!invoice?.clientId) {
        console.log('No clientId provided in invoice');
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Charger les données du client
        console.log('Loading client with ID:', invoice.clientId);
        if (!user?.id) {
          throw new Error("Utilisateur non authentifié");
        }
        const allClients = await clientsService.getAll(user.id);
        console.log('All clients loaded:', allClients);
        const clientData = allClients.find(c => c.id === invoice.clientId);
        console.log('Client data found:', clientData);
        
        if (!clientData) {
          console.warn('Client not found with ID:', invoice.clientId);
          toast({
            title: "Avertissement",
            description: "Client introuvable pour cette facture",
            variant: "destructive",
          });
        }
        
        setClient(clientData || null);
        
        // Charger les vraies lignes de facture depuis la base de données
        const invoiceLineItems = await lineItemsService.getByInvoiceId(invoice.id);
        setLineItems(invoiceLineItems);
        
      } catch (error) {
        console.error('Error loading invoice data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de la facture",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [open, invoice, toast]);

  const handleDownload = async () => {
    if (!client) return;
    
    try {
      setIsDownloading(true);
      
      const blob = await generateInvoicePDF({
        invoice,
        client,
        lineItems
      });
      
      // Créer un lien de téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Facture_${invoice.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Succès",
        description: "Le PDF a été téléchargé avec succès",
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] bg-slate-900 border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-white">
                Facture #{invoice.number}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Visualisez et téléchargez votre facture au format PDF
              </DialogDescription>
            </div>
            <Button
              onClick={handleDownload}
              disabled={isDownloading || isLoading || !client}
              className="bg-primary hover:bg-blue-600"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Téléchargement...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger PDF
                </>
              )}
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-slate-400">Chargement du PDF...</p>
              </div>
            </div>
          ) : client ? (
            <div className="h-full bg-white rounded-lg overflow-hidden">
              <InvoicePDFViewer
                invoice={invoice}
                client={client}
                lineItems={lineItems}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-400">Impossible de charger les données de la facture</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}