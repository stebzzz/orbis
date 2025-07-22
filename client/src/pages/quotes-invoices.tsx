import { useState, useEffect } from "react";
import { Plus, FileText, Download, Eye, Edit, ArrowRight, Sparkles, Receipt, Calculator, CheckCircle, Clock, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuoteModal } from "@/components/modals/quote-modal";
import { InvoiceModal } from "@/components/modals/invoice-modal";
import { InvoicePDFModal } from "@/components/modals/invoice-pdf-modal";
import { QuotePDFModal } from "@/components/modals/quote-pdf-modal";
import { useToast } from "@/hooks/use-toast";
import { quotesService, invoicesService } from "@/lib/firebase-service";
import { useAuth } from "@/hooks/useAuth";
import type { Quote, Invoice } from "@shared/schema";

export default function QuotesInvoices() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [isQuotePDFModalOpen, setIsQuotePDFModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedInvoiceForPDF, setSelectedInvoiceForPDF] = useState<Invoice | null>(null);
  const [selectedQuoteForPDF, setSelectedQuoteForPDF] = useState<Quote | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const [quotesData, invoicesData] = await Promise.all([
          quotesService.getAll(user.id),
          invoicesService.getAll(user.id)
        ]);
        setQuotes(quotesData);
        setInvoices(invoicesData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: "Erreur",
          description: "Erreur lors du chargement des données",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, toast]);

  const getStatusConfig = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "secondary" | "default" | "destructive"; color: string }> = {
      brouillon: { label: "Brouillon", variant: "secondary" as const, color: "bg-gray-100 text-gray-800" },
      envoye: { label: "Envoyé", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
      accepte: { label: "Accepté", variant: "default" as const, color: "bg-green-100 text-green-800" },
      refuse: { label: "Refusé", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
      paye: { label: "Payé", variant: "default" as const, color: "bg-green-100 text-green-800" },
      en_retard: { label: "En retard", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
      expire: { label: "Expiré", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
      annule: { label: "Annulé", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
    };
    return statusConfig[status] || statusConfig.brouillon;
  };

  const getStatusBadge = (status: string, type: 'quote' | 'invoice') => {
    const config = getStatusConfig(status);
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsQuoteModalOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleViewInvoicePDF = (invoice: Invoice) => {
    setSelectedInvoiceForPDF(invoice);
    setIsPDFModalOpen(true);
  };

  const handleViewQuotePDF = (quote: Quote) => {
    setSelectedQuoteForPDF(quote);
    setIsQuotePDFModalOpen(true);
  };

  const handleNewQuote = () => {
    setSelectedQuote(null);
    setIsQuoteModalOpen(true);
  };

  const handleNewInvoice = () => {
    setSelectedInvoice(null);
    setIsInvoiceModalOpen(true);
  };

  const handleConvertToInvoice = async (quoteId: string) => {
    if (confirm("Voulez-vous convertir ce devis en facture ?")) {
      try {
        // TODO: Implémenter la conversion devis vers facture
        toast({
          title: "Info",
          description: "Fonctionnalité de conversion en cours de développement",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Erreur lors de la conversion",
          variant: "destructive",
        });
      }
    }
  };

  const handleInvoiceStatusChange = async (invoice: Invoice, newStatus: Invoice['status']) => {
    try {
      await invoicesService.update(invoice.id, { status: newStatus });
      toast({
        title: "Succès",
        description: "Statut de la facture mis à jour",
      });
      await refreshData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du statut",
        variant: "destructive",
      });
    }
  };

  const getStatusActions = (invoice: Invoice) => {
    const actions = [];
    
    switch (invoice.status) {
      case 'brouillon':
        actions.push({
          label: 'Envoyer',
          icon: ArrowRight,
          action: () => handleInvoiceStatusChange(invoice, 'envoye'),
          className: 'text-blue-400 hover:text-blue-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10'
        });
        break;
      case 'envoye':
        actions.push({
          label: 'Marquer comme payé',
          icon: CheckCircle,
          action: () => handleInvoiceStatusChange(invoice, 'paye'),
          className: 'text-green-400 hover:text-green-300 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-emerald-500/10'
        });
        actions.push({
          label: 'Marquer en retard',
          icon: AlertTriangle,
          action: () => handleInvoiceStatusChange(invoice, 'en_retard'),
          className: 'text-orange-400 hover:text-orange-300 hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-red-500/10'
        });
        break;
      case 'en_retard':
        actions.push({
          label: 'Marquer comme payé',
          icon: CheckCircle,
          action: () => handleInvoiceStatusChange(invoice, 'paye'),
          className: 'text-green-400 hover:text-green-300 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-emerald-500/10'
        });
        break;
      case 'paye':
        // Aucune action pour les factures payées
        break;
      default:
        break;
    }
    
    // Action d'annulation disponible pour tous les statuts sauf payé
    if (invoice.status !== 'paye') {
      actions.push({
        label: 'Annuler',
        icon: X,
        action: () => handleInvoiceStatusChange(invoice, 'annule'),
        className: 'text-red-400 hover:text-red-300 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-pink-500/10'
      });
    }
    
    return actions;
  };

  const refreshData = async () => {
    if (!user) return;
    
    try {
      const [quotesData, invoicesData] = await Promise.all([
        quotesService.getAll(),
        invoicesService.getAll()
      ]);
      setQuotes(quotesData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Erreur lors du rechargement des données:', error);
    }
  };

  if (isLoading) {
    return (
      <motion.div 
        className="flex h-screen items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="relative"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
          <motion.div 
            className="relative w-16 h-16 border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #3b82f6)'
            }}
          >
            <div className="absolute inset-1 bg-background rounded-full flex items-center justify-center">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="flex-1 overflow-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Header
          title="Devis & Factures"
          subtitle={`${quotes.length} devis • ${invoices.length} factures`}
          action={
            <div className="flex space-x-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Button 
                  onClick={handleNewQuote} 
                  variant="outline" 
                  className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/50 text-slate-300 hover:from-slate-700/70 hover:to-slate-600/70 hover:border-slate-500 backdrop-blur-sm transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Devis
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Button 
                  onClick={handleNewInvoice} 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Facture
                </Button>
              </motion.div>
            </div>
          }
        />
      </motion.div>

      <motion.div 
        className="p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Tabs defaultValue="quotes" className="w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <TabsList className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-600/50 backdrop-blur-sm shadow-lg">
              <TabsTrigger 
                value="quotes" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Devis ({quotes.length})
              </TabsTrigger>
              <TabsTrigger 
                value="invoices" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                Factures ({invoices.length})
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="quotes" className="mt-6">
            {quotes.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <motion.div 
                  className="relative w-20 h-20 mx-auto mb-6"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Calculator className="w-8 h-8 text-blue-400" />
                  </div>
                  <motion.div
                    className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                  </motion.div>
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  Aucun devis
                </motion.h3>
                <motion.p 
                  className="text-slate-500 max-w-md mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  Commencez par créer votre premier devis pour gérer vos propositions commerciales.
                </motion.p>
              </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <AnimatePresence>
                  {quotes.map((quote, index) => (
                    <motion.div
                      key={quote.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ 
                        y: -5,
                        transition: { duration: 0.2 }
                      }}
                      className="group"
                    >
                      <Card className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 group-hover:border-blue-500/50 group-hover:shadow-lg group-hover:shadow-blue-500/10 glass">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <CardHeader className="relative">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-white text-lg font-semibold">Devis #{quote.number}</CardTitle>
                              <p className="text-sm text-slate-400 mt-1">
                                {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                              </p>
                              <div className="mt-3">
                                {getStatusBadge(quote.status, 'quote')}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleViewQuotePDF(quote)}
                                  className="text-blue-400 hover:text-blue-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 transition-all duration-200"
                                  title="Voir le PDF"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditQuote(quote)}
                                  className="text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 transition-all duration-200"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </motion.div>
                              {quote.status === 'accepte' && (
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleConvertToInvoice(quote.id.toString())}
                                    className="text-green-400 hover:text-green-300 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-emerald-500/10 transition-all duration-200"
                                  >
                                    <ArrowRight className="w-4 h-4" />
                                  </Button>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                         <CardContent className="relative">
                           <div className="space-y-4">
                             <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                               <p className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                 {Number(quote.total).toLocaleString('fr-FR', {
                                   style: 'currency',
                                   currency: 'EUR'
                                 })}
                               </p>
                               <p className="text-sm text-slate-400">HT</p>
                             </div>
                             
                             {quote.validityDate && (
                               <div className="text-sm bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3 border border-blue-500/20">
                                 <span className="text-slate-400">Valide jusqu'au: </span>
                                 <span className="text-white font-medium">
                                   {new Date(quote.validityDate).toLocaleDateString('fr-FR')}
                                 </span>
                               </div>
                             )}
                           </div>
                         </CardContent>
                       </Card>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </motion.div>
            )}
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            {invoices.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <motion.div 
                  className="relative w-20 h-20 mx-auto mb-6"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-xl"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Receipt className="w-8 h-8 text-green-400" />
                  </div>
                  <motion.div
                    className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                  </motion.div>
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  Aucune facture
                </motion.h3>
                <motion.p 
                  className="text-slate-500 max-w-md mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  Vos factures apparaîtront ici une fois créées ou converties depuis vos devis.
                </motion.p>
              </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <AnimatePresence>
                  {invoices.map((invoice, index) => (
                    <motion.div
                      key={invoice.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ 
                        y: -5,
                        transition: { duration: 0.2 }
                      }}
                      className="group"
                    >
                      <Card className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 group-hover:border-green-500/50 group-hover:shadow-lg group-hover:shadow-green-500/10 glass">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <CardHeader className="relative">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-white text-lg font-semibold">Facture #{invoice.number}</CardTitle>
                              <p className="text-sm text-slate-400 mt-1">
                                {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('fr-FR') : 'Date inconnue'}
                              </p>
                              <div className="mt-3">
                                {getStatusBadge(invoice.status, 'invoice')}
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleViewInvoicePDF(invoice)}
                                  className="text-blue-400 hover:text-blue-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 transition-all duration-200"
                                  title="Voir le PDF"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditInvoice(invoice)}
                                  className="text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 transition-all duration-200"
                                  title="Modifier"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </CardHeader>
                         <CardContent className="relative">
                           <div className="space-y-4">
                             <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                               <p className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                 {Number(invoice.total).toLocaleString('fr-FR', {
                                   style: 'currency',
                                   currency: 'EUR'
                                 })}
                               </p>
                               <p className="text-sm text-slate-400">HT</p>
                             </div>
                             
                             {invoice.dueDate && (
                               <div className={`text-sm rounded-lg p-3 border ${
                                 new Date(invoice.dueDate) < new Date() && invoice.status !== 'paye'
                                   ? 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20' 
                                   : 'bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20'
                               }`}>
                                 <span className="text-slate-400">Échéance: </span>
                                 <span className={`font-medium ${
                                   new Date(invoice.dueDate) < new Date() && invoice.status !== 'paye'
                                     ? 'text-red-400' 
                                     : 'text-white'
                                 }`}>
                                   {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                                 </span>
                               </div>
                             )}
                             
                             {/* Actions de changement de statut */}
                             {getStatusActions(invoice).length > 0 && (
                               <div className="space-y-2">
                                 <p className="text-xs text-slate-400 font-medium">Actions rapides:</p>
                                 <div className="flex flex-wrap gap-2">
                                   {getStatusActions(invoice).map((action, actionIndex) => {
                                     const IconComponent = action.icon;
                                     return (
                                       <motion.div
                                         key={actionIndex}
                                         whileHover={{ scale: 1.05 }}
                                         whileTap={{ scale: 0.95 }}
                                         className="flex-1 min-w-0"
                                       >
                                         <Button
                                           size="sm"
                                           variant="ghost"
                                           onClick={action.action}
                                           className={`w-full text-xs ${action.className} transition-all duration-200 border border-transparent hover:border-current/20`}
                                           title={action.label}
                                         >
                                           <IconComponent className="w-3 h-3 mr-1" />
                                           <span className="truncate">{action.label}</span>
                                         </Button>
                                       </motion.div>
                                     );
                                   })}
                                 </div>
                               </div>
                             )}
                           </div>
                         </CardContent>
                       </Card>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Enhanced Modals */}
      <AnimatePresence>
        <QuoteModal 
          open={isQuoteModalOpen}
          onOpenChange={setIsQuoteModalOpen}
          quote={selectedQuote || undefined}
          onSuccess={refreshData}
        />
        
        <InvoiceModal 
          open={isInvoiceModalOpen}
          onOpenChange={setIsInvoiceModalOpen}
          invoice={selectedInvoice || undefined}
          onSuccess={refreshData}
        />
        
        {selectedInvoiceForPDF && (
          <InvoicePDFModal 
            open={isPDFModalOpen}
            onOpenChange={setIsPDFModalOpen}
            invoice={selectedInvoiceForPDF}
          />
        )}

        {selectedQuoteForPDF && (
          <QuotePDFModal 
            open={isQuotePDFModalOpen}
            onOpenChange={setIsQuotePDFModalOpen}
            quote={selectedQuoteForPDF}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}