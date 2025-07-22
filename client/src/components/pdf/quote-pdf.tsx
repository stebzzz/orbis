import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, pdf } from '@react-pdf/renderer';
import { getCompanySettings } from '@/pages/settings';
import { useAuth } from '@/hooks/useAuth';
import type { Quote, Client } from '@shared/schema';

interface QuotePDFProps {
  quote: Quote;
  client: Client;
  lineItems?: Array<{
    product: string;
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate?: number;
  }>;
  companySettings?: any;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 0,
    fontFamily: 'Helvetica',
  },
  // Header avec bande colorée
  headerBand: {
    backgroundColor: '#4f46e5', // Couleur différente pour distinguer des factures
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandSection: {
    flexDirection: 'column',
  },
  brandName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 9,
    color: '#cbd5e1',
    marginTop: 2,
  },
  quoteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  // Contenu principal
  mainContent: {
    padding: 18,
    flex: 1,
  },
  // Section informations en cartes
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderLeft: '3px solid #4f46e5',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardText: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.3,
    marginBottom: 2,
  },
  // Section numéro de devis
  quoteNumberSection: {
    backgroundColor: '#4f46e5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  quoteNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  quoteDate: {
    fontSize: 10,
    color: '#e2e8f0',
    marginTop: 3,
  },
  // Table moderne
  table: {
    marginTop: 20,
    borderRadius: 6,
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #e2e8f0',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  tableCell: {
    fontSize: 8,
    color: '#374151',
    lineHeight: 1.3,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  col1: { width: '25%' },
  col2: { width: '25%' },
  col3: { width: '15%', textAlign: 'center' },
  col4: { width: '15%', textAlign: 'right' },
  col5: { width: '20%', textAlign: 'right' },
  // Section totaux
  totalsSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsCard: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    minWidth: 180,
    borderLeft: '3px solid #4f46e5',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTop: '2px solid #4f46e5',
  },
  finalTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4f46e5',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  finalTotalValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  // Section notes
  notesSection: {
    marginTop: 25,
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    borderLeft: '3px solid #4f46e5',
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#334155',
  },
  // Footer moderne
  footer: {
    marginTop: 20,
    paddingTop: 12,
    borderTop: '1px solid #e2e8f0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'center',
  },
  // Watermark subtil
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 60,
    color: '#f1f5f9',
    opacity: 0.1,
    zIndex: -1,
  },
  // Section validité
  validitySection: {
    marginTop: 15,
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    borderLeft: '3px solid #4f46e5',
  },
  validityTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  validityText: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#334155',
  },
});

const QuotePDFDocument: React.FC<QuotePDFProps> = ({ quote, client, lineItems = [], companySettings }) => {
  
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Invalid Date';
    try {
      return new Date(date).toLocaleDateString('fr-FR');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0,00 €';
    
    // Formatage manuel pour éviter les problèmes avec toLocaleString dans react-pdf
    const fixedAmount = amount.toFixed(2);
    const [integerPart, decimalPart] = fixedAmount.split('.');
    
    // Ajouter des espaces pour les milliers
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    
    return `${formattedInteger},${decimalPart} €`;
  };

  const clientName = client.type === 'professionnel' 
    ? client.companyName || 'Société sans nom'
    : `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client sans nom';

  // Construire l'adresse en gérant les valeurs undefined
  const addressParts = [];
  if (client.address) addressParts.push(client.address);
  
  const cityLine = [client.postalCode, client.city].filter(Boolean).join(' ');
  if (cityLine) addressParts.push(cityLine);
  
  if (client.country) addressParts.push(client.country);
  
  const clientAddress = [clientName, ...addressParts].join('\n');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header avec bande colorée */}
        <View style={styles.headerBand}>
          <View style={styles.brandSection}>
            <Text style={styles.brandName}>{companySettings?.companyName || 'Votre Entreprise'}</Text>
            {companySettings?.siret && (
              <Text style={styles.brandSubtitle}>SIRET: {companySettings.siret}</Text>
            )}
            {companySettings?.address && (
              <Text style={styles.brandSubtitle}>{companySettings.address}</Text>
            )}
            {(companySettings?.postalCode || companySettings?.city) && (
              <Text style={styles.brandSubtitle}>
                {[companySettings.postalCode, companySettings.city].filter(Boolean).join(' ')}
              </Text>
            )}
          </View>
          <Text style={styles.quoteTitle}>DEVIS</Text>
        </View>

        {/* Contenu principal */}
        <View style={styles.mainContent}>
          {/* Numéro de devis stylé */}
          <View style={styles.quoteNumberSection}>
            <Text style={styles.quoteNumber}>N° {quote.number}</Text>
            <Text style={styles.quoteDate}>Émis le {formatDate(quote.issueDate)}</Text>
          </View>

          {/* Informations en cartes */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Devis pour</Text>
              <Text style={styles.cardText}>{clientName}</Text>
              {client.address && <Text style={styles.cardText}>{client.address}</Text>}
              {cityLine && <Text style={styles.cardText}>{cityLine}</Text>}
              {client.country && <Text style={styles.cardText}>{client.country}</Text>}
              {client.email && <Text style={styles.cardText}>Email: {client.email}</Text>}
              {client.phone && <Text style={styles.cardText}>Tél: {client.phone}</Text>}
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Détails du devis</Text>
              <Text style={styles.cardText}>Date d'émission: {formatDate(quote.issueDate)}</Text>
              <Text style={styles.cardText}>Date de validité: {formatDate(quote.validityDate)}</Text>
              <Text style={styles.cardText}>Statut: {quote.status === 'accepte' ? 'Accepté' : quote.status === 'refuse' ? 'Refusé' : 'En attente'}</Text>
              {companySettings?.siret && (
                <Text style={styles.cardText}>SIRET: {companySettings.siret}</Text>
              )}
            </View>
          </View>

          {/* Table des articles moderne */}
          {lineItems.length > 0 && (
            <View style={[styles.table, {marginTop: lineItems.length > 5 ? 8 : 12}]}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellHeader, styles.col1]}>Produit</Text>
                <Text style={[styles.tableCellHeader, styles.col2]}>Description</Text>
                <Text style={[styles.tableCellHeader, styles.col3]}>Qté</Text>
                <Text style={[styles.tableCellHeader, styles.col4]}>Prix unitaire</Text>
                <Text style={[styles.tableCellHeader, styles.col5]}>Total</Text>
              </View>
              {lineItems.map((item, index) => {
                const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
                const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 0;
                const lineTotal = quantity * unitPrice;
                
                return (
                  <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                    <Text style={[styles.tableCell, styles.col1]}>{item.product || 'Produit manquant'}</Text>
                    <Text style={[styles.tableCell, styles.col2]}>{item.description || 'Description manquante'}</Text>
                    <Text style={[styles.tableCell, styles.col3]}>{quantity}</Text>
                    <Text style={[styles.tableCell, styles.col4]}>{formatCurrency(unitPrice)}</Text>
                    <Text style={[styles.tableCell, styles.col5]}>
                      {formatCurrency(lineTotal)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Section totaux redesignée */}
          <View style={[styles.totalsSection, {marginTop: lineItems.length > 5 ? 8 : 12}]}>
            <View style={styles.totalsCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Sous-total HT</Text>
                <Text style={styles.totalValue}>{formatCurrency(quote.subtotal)}</Text>
              </View>
              {(quote.vatAmount && quote.vatAmount > 0) && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TVA</Text>
                  <Text style={styles.totalValue}>{formatCurrency(quote.vatAmount)}</Text>
                </View>
              )}
              <View style={styles.finalTotalRow}>
                <Text style={styles.finalTotalLabel}>TOTAL TTC</Text>
                <Text style={styles.finalTotalValue}>{formatCurrency(quote.total)}</Text>
              </View>
            </View>
          </View>

          {/* Section validité */}
          <View style={styles.validitySection}>
            <Text style={styles.validityTitle}>VALIDITÉ DU DEVIS</Text>
            <Text style={styles.validityText}>Ce devis est valable jusqu'au {formatDate(quote.validityDate)}.</Text>
            <Text style={styles.validityText}>Pour accepter ce devis, veuillez nous le retourner signé avec la mention "Bon pour accord".</Text>
          </View>

          {/* Notes et conditions */}
          {(quote.notes || quote.termsConditions) && (
            <View style={[styles.notesSection, {marginTop: 15}]}>
              {quote.notes && (
                <>
                  <Text style={styles.notesTitle}>NOTES</Text>
                  <Text style={styles.notesText}>{quote.notes}</Text>
                </>
              )}
              {quote.termsConditions && (
                <>
                  {quote.notes && <Text style={{marginTop: 5}}></Text>}
                  <Text style={styles.notesTitle}>CONDITIONS GÉNÉRALES</Text>
                  <Text style={styles.notesText}>{quote.termsConditions}</Text>
                </>
              )}
            </View>
          )}

          {/* Footer moderne */}
          <View style={[styles.footer, {marginTop: lineItems.length > 5 ? 10 : 20}]}>
            <Text style={styles.footerText}>Merci pour votre confiance</Text>
            <Text style={styles.footerText}>
              {companySettings?.email && `Email: ${companySettings.email}`}
              {companySettings?.email && companySettings?.phone && ' • '}
              {companySettings?.phone && `Tél: ${companySettings.phone}`}
              {(!companySettings?.email && !companySettings?.phone) && 'Email: contact@orbis.fr • Tél: +33 1 23 45 67 89'}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export const QuotePDFViewer: React.FC<QuotePDFProps> = (props) => {
  const { user } = useAuth();
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        try {
          const settings = await getCompanySettings(user.id);
          setCompanySettings(settings);
        } catch (error) {
          console.error('Error loading company settings:', error);
        }
      }
      setLoading(false);
    };

    loadSettings();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2">Chargement des paramètres...</span>
      </div>
    );
  }

  return (
    <PDFViewer width="100%" height="600px">
      <QuotePDFDocument {...props} companySettings={companySettings} />
    </PDFViewer>
  );
};

export default function QuotePDF({ quote, client }: QuotePDFProps) {
  const { user } = useAuth();
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        try {
          const settings = await getCompanySettings(user.id);
          setCompanySettings(settings);
        } catch (error) {
          console.error('Error loading company settings:', error);
        }
      }
      setLoading(false);
    };

    loadSettings();
  }, [user]);

  if (!quote || !client) {
    return <div>Données manquantes pour générer le devis</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2">Chargement des paramètres...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <PDFViewer width="100%" height="100%">
        <QuotePDFDocument quote={quote} client={client} companySettings={companySettings} />
      </PDFViewer>
    </div>
  );
}

export const generateQuotePDF = async (props: QuotePDFProps, userId?: string) => {
  let companySettings = null;
  if (userId) {
    try {
      companySettings = await getCompanySettings(userId);
    } catch (error) {
      console.error('Error loading company settings for PDF generation:', error);
    }
  } else if (props.quote?.userId) {
    try {
      companySettings = await getCompanySettings(props.quote.userId);
    } catch (error) {
      console.error('Error loading company settings using quote userId:', error);
    }
  }
  const blob = await pdf(<QuotePDFDocument {...props} companySettings={companySettings} />).toBlob();
  return blob;
};