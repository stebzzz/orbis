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
          console.log('Chargement du client avec ID:', quote.clientId, 'Type:', typeof quote.clientId);
          // S'assurer que clientId est une chaîne de caractères valide et non vide
          const clientId = String(quote.clientId); // Utiliser String() au lieu de toString() pour éviter l'erreur de type 'never'
          if (!clientId || clientId === 'undefined' || clientId === 'null') {
            console.error('ClientId invalide:', clientId);
            throw new Error('ID client invalide');
          }
          const clientData = await clientsService.getById(clientId);
          console.log('Données client récupérées:', clientData);
          if (!clientData) {
            console.error('Aucune donnée client trouvée pour l\'ID:', clientId);
            throw new Error('Client introuvable');
          }
          setClient(clientData);
        } else {
          console.error('Aucun clientId trouvé dans le devis:', quote);
          throw new Error('ID client manquant');
        }
        
        // Charger les lignes du devis
        if (quote.id) {
          console.log('Chargement des lignes pour le devis ID:', quote.id);
          const lineItemsData = await lineItemsService.getByQuoteId(quote.id.toString());
          console.log('Lignes récupérées:', lineItemsData);
          setLineItems(lineItemsData.map(item => ({
            product: item.product || '', // Utiliser item.product au lieu de item.name pour correspondre au type LineItem
            description: item.description || '',
            quantity: item.quantity || 0,
            unitPrice: item.unitPrice || 0,
            vatRate: 0 // TVA 0%
          })));
        }
      } catch (error) {
        console.error('Error loading data for PDF:', error);
        let errorMessage = "Impossible de charger les données du devis";
        
        // Messages d'erreur plus spécifiques
        if (error instanceof Error) {
          if (error.message === 'ID client invalide') {
            errorMessage = "L'identifiant du client est invalide";
          } else if (error.message === 'Client introuvable') {
            errorMessage = "Le client associé à ce devis est introuvable";
          } else if (error.message === 'ID client manquant') {
            errorMessage = "Aucun client n'est associé à ce devis";
          }
        }
        
        toast({
          title: "Erreur",
          description: errorMessage,
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-slate-400 text-lg font-medium mb-2">Impossible de charger les informations du client</p>
                <p className="text-slate-500 text-sm">Veuillez vérifier que le client existe et qu'il est correctement associé à ce devis.</p>
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