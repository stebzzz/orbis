import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, Calculator, Euro, Calendar, BarChart3 } from "lucide-react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Invoice, Expense, Client, DashboardMetrics } from "@shared/schema";

export default function Reports() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [urssafRevenue, setUrssafRevenue] = useState("");
  const [urssafActivity, setUrssafActivity] = useState("liberale");
  const [hasACRE, setHasACRE] = useState("false");
  const [isVersementLiberatoire, setIsVersementLiberatoire] = useState("false");
  const { toast } = useToast();

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/invoices"],
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/expenses"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/clients"],
  });

  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ["/dashboard/metrics"],
  });

  // Filter data by selected year
  const yearInvoices = invoices.filter(invoice => 
    new Date(invoice.issueDate).getFullYear().toString() === selectedYear &&
    invoice.status === 'paye'
  );

  const yearExpenses = expenses.filter(expense => 
    new Date(expense.date).getFullYear().toString() === selectedYear
  );

  // Generate data for exports
  const generateLivreRecettes = () => {
    const data = yearInvoices.map(invoice => {
      const client = clients.find(c => c.id === invoice.clientId);
      const clientName = client?.type === 'professionnel' 
        ? client.companyName || 'Société sans nom'
        : `${client?.firstName} ${client?.lastName}`;

      return {
        'Date': new Date(invoice.paidDate || invoice.issueDate).toLocaleDateString('fr-FR'),
        'Numéro Facture': invoice.number,
        'Client': clientName,
        'Description': 'Prestation de service',
        'Montant HT': Number(invoice.subtotal).toFixed(2),
        'TVA': Number(invoice.vatAmount).toFixed(2),
        'Montant TTC': Number(invoice.total).toFixed(2),
      };
    });

    return data;
  };

  const generateRegistreAchats = () => {
    const data = yearExpenses.map(expense => ({
      'Date': new Date(expense.date).toLocaleDateString('fr-FR'),
      'Description': expense.description,
      'Catégorie': expense.category || '',
      'Montant TTC': Number(expense.amount).toFixed(2),
      'TVA Récupérable': Number(expense.vatAmount || 0).toFixed(2),
      'Montant HT': (Number(expense.amount) - Number(expense.vatAmount || 0)).toFixed(2),
    }));

    return data;
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: "Aucune donnée à exporter",
        description: "Il n'y a pas de données pour la période sélectionnée.",
        variant: "destructive",
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${selectedYear}.csv`;
    link.click();

    toast({
      title: "Export réussi",
      description: `Le fichier ${filename}_${selectedYear}.csv a été téléchargé.`,
    });
  };

  // URSSAF calculations
  const calculateURSSAF = () => {
    const revenue = Number(urssafRevenue) || (metrics?.revenue.current || 0);
    
    let rate = 0.22; // Default rate for liberal professions
    
    if (urssafActivity === "commerciale") {
      rate = 0.124;
    } else if (urssafActivity === "artisanale") {
      rate = 0.22;
    }

    // ACRE reduction (first year: 50% reduction, second year: 25% reduction)
    if (hasACRE === "true") {
      rate = rate * 0.5; // First year reduction
    }

    // Versement libératoire
    if (isVersementLiberatoire === "true") {
      if (urssafActivity === "commerciale") {
        rate = 0.01; // 1% for commercial activity
      } else if (urssafActivity === "artisanale") {
        rate = 0.018; // 1.8% for artisanal activity
      } else {
        rate = 0.022; // 2.2% for liberal professions
      }
    }

    return {
      revenue,
      rate: rate * 100,
      cotisations: revenue * rate,
    };
  };

  const urssafCalculation = calculateURSSAF();

  const availableYears = Array.from(
    new Set([
      ...invoices.map(i => new Date(i.issueDate).getFullYear()),
      ...expenses.map(e => new Date(e.date).getFullYear()),
      new Date().getFullYear()
    ])
  ).sort((a, b) => b - a);

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Rapports & Exports"
        subtitle="Documents comptables et simulateurs"
      />

      <div className="p-6 space-y-6">
        {/* Year Selection */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Période de reporting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="space-y-2">
                <Label className="text-foreground">Année</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32 bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end space-x-2">
                <Badge variant="outline" className="border-border">
                  {yearInvoices.length} facture{yearInvoices.length > 1 ? 's' : ''} payée{yearInvoices.length > 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className="border-border">
                  {yearExpenses.length} dépense{yearExpenses.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="exports" className="w-full">
          <TabsList className="bg-card border-border">
            <TabsTrigger value="exports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Exports Comptables
            </TabsTrigger>
            <TabsTrigger value="urssaf" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Simulateur URSSAF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exports" className="mt-6 space-y-6">
            {/* Revenue Summary */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Résumé Financier {selectedYear}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">
                      {yearInvoices.reduce((sum, inv) => sum + Number(inv.total), 0).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </div>
                    <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {yearExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </div>
                    <p className="text-sm text-muted-foreground">Dépenses</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {(
                        yearInvoices.reduce((sum, inv) => sum + Number(inv.total), 0) -
                        yearExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
                      ).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </div>
                    <p className="text-sm text-muted-foreground">Bénéfice net</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-secondary" />
                    Livre des Recettes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Document obligatoire listant toutes les recettes encaissées pendant l'année {selectedYear}.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Nombre de factures:</span>
                      <span className="text-foreground">{yearInvoices.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Montant total:</span>
                      <span className="text-foreground font-medium">
                        {yearInvoices.reduce((sum, inv) => sum + Number(inv.total), 0).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => exportToCSV(generateLivreRecettes(), 'livre_recettes')}
                    className="w-full bg-secondary hover:bg-secondary/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter en CSV
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-accent" />
                    Registre des Achats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Document obligatoire listant toutes les dépenses professionnelles de l'année {selectedYear}.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Nombre de dépenses:</span>
                      <span className="text-foreground">{yearExpenses.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Montant total:</span>
                      <span className="text-foreground font-medium">
                        {yearExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => exportToCSV(generateRegistreAchats(), 'registre_achats')}
                    className="w-full bg-accent hover:bg-accent/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter en CSV
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                    Export Clients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Liste complète de tous vos clients avec leurs informations de contact.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Nombre de clients:</span>
                      <span className="text-foreground">{clients.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Particuliers:</span>
                      <span className="text-foreground">{clients.filter(c => c.type === 'particulier').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Professionnels:</span>
                      <span className="text-foreground">{clients.filter(c => c.type === 'professionnel').length}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => exportToCSV(
                      clients.map(client => ({
                        'Type': client.type,
                        'Nom': client.type === 'professionnel' ? client.companyName : `${client.firstName} ${client.lastName}`,
                        'Email': client.email,
                        'Téléphone': client.phone || '',
                        'Ville': client.city || '',
                        'SIRET': client.siret || '',
                      })),
                      'clients'
                    )}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter en CSV
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                    Rapport Annuel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Synthèse complète de l'activité avec tous les documents et statistiques.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">CA réalisé:</span>
                      <span className="text-foreground font-medium">
                        {yearInvoices.reduce((sum, inv) => sum + Number(inv.total), 0).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Nombre de projets:</span>
                      <span className="text-foreground">En cours de développement</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Bientôt disponible
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="urssaf" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* URSSAF Calculator */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    Simulateur de Cotisations URSSAF
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Chiffre d'affaires annuel (€)</Label>
                    <Input
                      type="number"
                      value={urssafRevenue}
                      onChange={(e) => setUrssafRevenue(e.target.value)}
                      placeholder={`${metrics?.revenue.current || 0}`}
                      className="bg-muted border-border text-foreground"
                    />
                    <p className="text-xs text-muted-foreground">
                      Laissez vide pour utiliser le CA actuel: {(metrics?.revenue.current || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Type d'activité</Label>
                    <Select value={urssafActivity} onValueChange={setUrssafActivity}>
                      <SelectTrigger className="bg-muted border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="commerciale">Activité commerciale (12,4%)</SelectItem>
                        <SelectItem value="artisanale">Activité artisanale (22%)</SelectItem>
                        <SelectItem value="liberale">Profession libérale (22%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Bénéficiez-vous de l'ACRE ?</Label>
                    <Select value={hasACRE} onValueChange={setHasACRE}>
                      <SelectTrigger className="bg-muted border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="false">Non</SelectItem>
                        <SelectItem value="true">Oui (réduction 50%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Versement libératoire</Label>
                    <Select value={isVersementLiberatoire} onValueChange={setIsVersementLiberatoire}>
                      <SelectTrigger className="bg-muted border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="false">Non (cotisations classiques)</SelectItem>
                        <SelectItem value="true">Oui (prélèvement forfaitaire)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* URSSAF Results */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Euro className="w-5 h-5 mr-2" />
                    Estimation des Cotisations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {urssafCalculation.cotisations.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </div>
                      <p className="text-muted-foreground">Cotisations annuelles estimées</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CA pris en compte:</span>
                        <span className="text-foreground font-medium">
                          {urssafCalculation.revenue.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taux applicable:</span>
                        <span className="text-foreground font-medium">{urssafCalculation.rate.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cotisations trimestrielles:</span>
                        <span className="text-foreground font-medium">
                          {(urssafCalculation.cotisations / 4).toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cotisations mensuelles:</span>
                        <span className="text-foreground font-medium">
                          {(urssafCalculation.cotisations / 12).toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <p className="text-xs text-muted-foreground">
                        * Cette estimation est donnée à titre indicatif. Les montants réels peuvent varier selon votre situation personnelle et les évolutions réglementaires.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
