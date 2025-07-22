import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { QuotePDFViewer, generateQuotePDF } from '@/components/pdf/quote-pdf';
import { useToast } from '@/hooks/use-toast';
import { clientsService, lineItemsService } from '@/lib/firebase-service';
import type { Quote, Client } from '@shared/schema';

interface QuotePDFModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote;
}

export function QuotePDFModal({ open, onOpenChange, quote }: QuotePDFModalProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      if (!quote || !open) return;
      
      setIsLoading(true);
      try {
        // Charger le client
        if (quote.clientId) {
          const clientData = await clientsService.getById(quote.clientId.toString());
          setClient(clientData);
        }
        
        // Charger les lignes du devis
        if (quote.id) {
          const lineItemsData = await lineItemsService.getByQuoteId(quote.id.toString());
          setLineItems(lineItemsData.map(item => ({
            product: item.name || '',
            description: item.description || '',
            quantity: item.quantity || 0,
            unitPrice: item.unitPrice || 0,
            vatRate: 0.2 // TVA 20%
          })));
        }
      } catch (error) {
        console.error('Error loading data for PDF:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du devis",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [quote, open, toast]);

  const handleDownload = async () => {
    if (!client) return;
    
    setIsDownloading(true);
    try {
      const blob = await generateQuotePDF({ quote, client, lineItems });
      
      // Créer un lien de téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Devis_${quote.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Succès",
        description: "Le devis a été téléchargé avec succès",
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
                Devis #{quote.number}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Visualisez et téléchargez votre devis au format PDF
              </DialogDescription>
            </div>
            <Button
              onClick={handleDownload}
              disabled={isDownloading || isLoading || !client}
              className="bg-indigo-600 hover:bg-indigo-700"
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
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-500" />
                <p className="text-slate-400">Chargement du devis...</p>
              </div>
            </div>
          ) : !client ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-slate-400">Impossible de charger les informations du client</p>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-md overflow-hidden">
              <QuotePDFViewer quote={quote} client={client} lineItems={lineItems} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}