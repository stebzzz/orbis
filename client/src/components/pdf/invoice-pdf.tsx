import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, pdf } from '@react-pdf/renderer';
import { getCompanySettings } from '@/pages/settings';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import type { Invoice, Client } from '@shared/schema';

interface InvoicePDFProps {
  invoice: Invoice;
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
    backgroundColor: '#1e40af',
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
  invoiceTitle: {
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
    borderLeft: '3px solid #3b82f6',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e40af',
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
  // Section numéro de facture
  invoiceNumberSection: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  invoiceDate: {
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
    borderLeft: '3px solid #10b981',
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
    borderTop: '2px solid #3b82f6',
  },
  finalTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  finalTotalValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  // Section notes
  notesSection: {
    marginTop: 25,
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    borderLeft: '3px solid #f59e0b',
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#78350f',
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
});

const InvoicePDFDocument: React.FC<InvoicePDFProps> = ({ invoice, client, lineItems = [], companySettings }) => {
  
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
            <Text style={styles.brandName}>{companySettings.companyName || clientName}</Text>
            {companySettings.siret && (
              <Text style={styles.brandSubtitle}>SIRET: {companySettings.siret}</Text>
            )}
            {companySettings.address && (
              <Text style={styles.brandSubtitle}>{companySettings.address}</Text>
            )}
            {(companySettings.postalCode || companySettings.city) && (
              <Text style={styles.brandSubtitle}>
                {[companySettings.postalCode, companySettings.city].filter(Boolean).join(' ')}
              </Text>
            )}
          </View>
          <Text style={styles.invoiceTitle}>FACTURE</Text>
        </View>

        {/* Contenu principal */}
        <View style={styles.mainContent}>
          {/* Numéro de facture stylé */}
          <View style={styles.invoiceNumberSection}>
            <Text style={styles.invoiceNumber}>N° {invoice.number}</Text>
            <Text style={styles.invoiceDate}>Émise le {formatDate(invoice.issueDate)}</Text>
          </View>

          {/* Informations en cartes */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Facturé à</Text>
              <Text style={styles.cardText}>{clientName}</Text>
              {client.address && <Text style={styles.cardText}>{client.address}</Text>}
              {cityLine && <Text style={styles.cardText}>{cityLine}</Text>}
              {client.country && <Text style={styles.cardText}>{client.country}</Text>}
              {client.email && <Text style={styles.cardText}>Email: {client.email}</Text>}
              {client.phone && <Text style={styles.cardText}>Tél: {client.phone}</Text>}
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Détails de paiement</Text>
              <Text style={styles.cardText}>Date d'échéance: {formatDate(invoice.dueDate)}</Text>
              <Text style={styles.cardText}>Statut: {invoice.status === 'paye' ? 'Payée' : 'En attente'}</Text>
              <Text style={styles.cardText}>Mode: Virement bancaire</Text>
              {companySettings.siret && (
                <Text style={styles.cardText}>SIRET: {companySettings.siret}</Text>
              )}
              {companySettings.iban && (
                <Text style={styles.cardText}>IBAN: {companySettings.iban}</Text>
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
                <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
              </View>
              {(invoice.vatAmount && invoice.vatAmount > 0) && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TVA</Text>
                  <Text style={styles.totalValue}>{formatCurrency(invoice.vatAmount)}</Text>
                </View>
              )}
              <View style={styles.finalTotalRow}>
                <Text style={styles.finalTotalLabel}>TOTAL TTC</Text>
                <Text style={styles.finalTotalValue}>{formatCurrency(invoice.total)}</Text>
              </View>
            </View>
          </View>

          {/* Notes et conditions combinées */}
          {(invoice.notes || invoice.paymentTerms || companySettings.rib) && (
            <View style={[styles.notesSection, {marginTop: lineItems.length > 5 ? 8 : 15}]}>
              {invoice.notes && (
                <>
                  <Text style={styles.notesTitle}>NOTES IMPORTANTES</Text>
                  <Text style={styles.notesText}>{invoice.notes}</Text>
                </>
              )}
              {invoice.paymentTerms && (
                <>
                  {invoice.notes && <Text style={{marginTop: 5}}></Text>}
                  <Text style={styles.notesTitle}>CONDITIONS DE PAIEMENT</Text>
                  <Text style={styles.notesText}>{invoice.paymentTerms}</Text>
                </>
              )}
              {companySettings.rib && (
                <>
                  {(invoice.notes || invoice.paymentTerms) && <Text style={{marginTop: 5}}></Text>}
                  <Text style={styles.notesTitle}>COORDONNEES BANCAIRES</Text>
                  <Text style={styles.notesText}>{companySettings.rib}</Text>
                </>
              )}
            </View>
          )}

          {/* Footer moderne */}
          <View style={[styles.footer, {marginTop: lineItems.length > 5 ? 10 : 20}]}>
            <Text style={styles.footerText}>Paiement par virement • Merci pour votre confiance</Text>
            <Text style={styles.footerText}>
              {companySettings.email && `Email: ${companySettings.email}`}
              {companySettings.email && companySettings.phone && ' • '}
              {companySettings.phone && `Tél: ${companySettings.phone}`}
              {(!companySettings.email && !companySettings.phone) && 'Email: contact@orbis.fr • Tél: +33 1 23 45 67 89'}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export const InvoicePDFViewer: React.FC<InvoicePDFProps> = (props) => {
  const [user] = useAuthState(auth);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        try {
          const settings = await getCompanySettings(user.uid);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des paramètres...</span>
      </div>
    );
  }

  return (
    <PDFViewer width="100%" height="600px">
      <InvoicePDFDocument {...props} companySettings={companySettings} />
    </PDFViewer>
  );
};

export default function InvoicePDF({ invoice, client }: InvoicePDFProps) {
  const [user] = useAuthState(auth);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        try {
          const settings = await getCompanySettings(user.uid);
          setCompanySettings(settings);
        } catch (error) {
          console.error('Error loading company settings:', error);
        }
      }
      setLoading(false);
    };

    loadSettings();
  }, [user]);

  if (!invoice || !client) {
    return <div>Données manquantes pour générer la facture</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des paramètres...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <PDFViewer width="100%" height="100%">
        <InvoicePDFDocument invoice={invoice} client={client} companySettings={companySettings} />
      </PDFViewer>
    </div>
  );
}

export const generateInvoicePDF = async (props: InvoicePDFProps, userId?: string) => {
  let companySettings = null;
  if (userId) {
    try {
      companySettings = await getCompanySettings(userId);
    } catch (error) {
      console.error('Error loading company settings for PDF generation:', error);
    }
  }
  const blob = await pdf(<InvoicePDFDocument {...props} companySettings={companySettings} />).toBlob();
  return blob;
};