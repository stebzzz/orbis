import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, Users, Clock, BarChart3, Calculator } from "lucide-react";
import { FirebaseAuth } from "@/components/auth/FirebaseAuth";

export default function Landing() {
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) {
    return <FirebaseAuth />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Orbis</h1>
            </div>
            <Button 
              onClick={() => setShowAuth(true)}
              className="bg-primary hover:bg-blue-600"
            >
              Se connecter
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Gérez votre entreprise en toute simplicité
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Orbis est la plateforme tout-en-un conçue pour les auto-entrepreneurs français. 
            Centralisez vos clients, projets, devis, factures et finances en un seul endroit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setShowAuth(true)}
              className="bg-primary hover:bg-blue-600"
            >
              Commencer gratuitement
            </Button>
            <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Voir la démonstration
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-slate-800/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-xl text-slate-300">
              Une plateforme complète pour gérer tous les aspects de votre activité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Users className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Gestion des Clients</CardTitle>
                <CardDescription className="text-slate-400">
                  Base de données complète avec historique des projets et documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-secondary mr-2" /> Fiches clients détaillées</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-secondary mr-2" /> Historique complet</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-secondary mr-2" /> Notes et commentaires</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <FileText className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Devis & Factures</CardTitle>
                <CardDescription className="text-slate-400">
                  Documents professionnels conformes à la législation française
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-secondary mr-2" /> Numérotation automatique</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-secondary mr-2" /> Génération PDF</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-secondary mr-2" /> Relances automatiques</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Clock className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Suivi du Temps</CardTitle>
                <CardDescription className="text-slate-400">
                  Chronomètre intégré pour valoriser chaque minute de travail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-secondary mr-2" /> Minuteur en temps réel</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-secondary mr-2" /> Saisie manuelle</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-secondary mr-2" /> Facturation automatique</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Tableau de Bord</CardTitle>
                <CardDescription className="text-slate-400">
                  Vision claire de votre performance en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-secondary mr-2" /> Métriques clés</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-secondary mr-2" /> Graphiques d'évolution</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-secondary mr-2" /> Alertes personnalisées</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Calculator className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Finances</CardTitle>
                <CardDescription className="text-slate-400">
                  Suivi financier et estimation des cotisations URSSAF
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-secondary mr-2" /> Gestion des dépenses</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-secondary mr-2" /> Calcul URSSAF</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-secondary mr-2" /> Rapports comptables</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <FileText className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Rapports & Exports</CardTitle>
                <CardDescription className="text-slate-400">
                  Documents légaux et exports comptables automatisés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-secondary mr-2" /> Livre des recettes</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-secondary mr-2" /> Registre des achats</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-secondary mr-2" /> Exports CSV/Excel</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à transformer votre activité ?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Rejoignez les auto-entrepreneurs qui ont choisi Orbis pour simplifier leur gestion quotidienne
          </p>
          <Button 
            size="lg" 
            onClick={() => setShowAuth(true)}
            className="bg-primary hover:bg-blue-600"
          >
            Commencer maintenant
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-800 py-8">
        <div className="container mx-auto px-6 text-center text-slate-400">
          <p>&copy; 2025 Orbis. Plateforme de gestion pour auto-entrepreneurs français.</p>
        </div>
      </footer>
    </div>
  );
}
