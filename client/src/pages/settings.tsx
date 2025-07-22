import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import { Building2, CreditCard, Phone, Mail, MapPin, Hash } from "lucide-react";
import { companySettingsService } from "@/lib/firebase-service";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

interface CompanySettings {
  companyName: string;
  siret: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  rib: string;
  iban: string;
  bic: string;
}

export default function Settings() {
  const { toast } = useToast();
  const [user, authLoading] = useAuthState(auth);
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: '',
    siret: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'France',
    phone: '',
    email: '',
    rib: '',
    iban: '',
    bic: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        try {
          const savedSettings = await companySettingsService.get(user.uid);
          if (savedSettings) {
            setSettings({
              companyName: savedSettings.companyName || '',
              siret: savedSettings.siret || '',
              address: savedSettings.address || '',
              postalCode: savedSettings.postalCode || '',
              city: savedSettings.city || '',
              country: 'France',
              phone: savedSettings.phone || '',
              email: savedSettings.email || '',
              rib: savedSettings.rib || '',
              iban: savedSettings.iban || '',
              bic: savedSettings.bic || ''
            });
          }
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }
      setInitialLoading(false);
    };

    if (!authLoading) {
      loadSettings();
    }
  }, [user, authLoading]);

  const handleInputChange = (field: keyof CompanySettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour sauvegarder.",
        variant: "destructive",
      });
      return;
    }

    setSaveLoading(true);
    try {
      await companySettingsService.createOrUpdate({
        ...settings,
        userId: user.uid
      });
      
      toast({
        title: "Paramètres sauvegardés",
        description: "Les informations de votre entreprise ont été mises à jour.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  if (authLoading || initialLoading) {
    return (
      <div className="space-y-6">
        <Header 
          title="Paramètres" 
          subtitle="Chargement..."
        />
        <div className="px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Header 
          title="Paramètres" 
          subtitle="Vous devez être connecté pour accéder aux paramètres"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header 
        title="Paramètres" 
        subtitle="Gérez les informations de votre entreprise"
      />
      
      <div className="px-6 space-y-6">
        {/* Informations de l'entreprise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Informations de l'entreprise
            </CardTitle>
            <CardDescription>
              Ces informations apparaîtront sur vos factures et devis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Votre nom ou raison sociale"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siret">Numéro SIRET *</Label>
                <Input
                  id="siret"
                  value={settings.siret}
                  onChange={(e) => handleInputChange('siret', e.target.value)}
                  placeholder="123 456 789 01234"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Rue de la République"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  value={settings.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder="75001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={settings.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Paris"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={settings.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="France"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations de contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Informations de contact
            </CardTitle>
            <CardDescription>
              Coordonnées pour vos clients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contact@monentreprise.fr"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations bancaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Informations bancaires
            </CardTitle>
            <CardDescription>
              Coordonnées bancaires pour les virements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rib">RIB (Relevé d'Identité Bancaire)</Label>
              <Textarea
                id="rib"
                value={settings.rib}
                onChange={(e) => handleInputChange('rib', e.target.value)}
                placeholder="Banque: Crédit Agricole\nTitulaire: Votre Nom\nIBAN: FR76 1234 5678 9012 3456 7890 123\nBIC: AGRIFRPP123"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={settings.iban}
                  onChange={(e) => handleInputChange('iban', e.target.value)}
                  placeholder="FR76 1234 5678 9012 3456 7890 123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bic">BIC/SWIFT</Label>
                <Input
                  id="bic"
                  value={settings.bic}
                  onChange={(e) => handleInputChange('bic', e.target.value)}
                  placeholder="AGRIFRPP123"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saveLoading}
            className="min-w-32"
          >
            {saveLoading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Fonction utilitaire pour récupérer les paramètres de l'entreprise
export const getCompanySettings = async (userId: string): Promise<CompanySettings> => {
  try {
    const savedSettings = await companySettingsService.get(userId);
    if (savedSettings) {
      return {
        companyName: savedSettings.companyName || '',
        siret: savedSettings.siret || '',
        address: savedSettings.address || '',
        postalCode: savedSettings.postalCode || '',
        city: savedSettings.city || '',
        country: 'France',
        phone: savedSettings.phone || '',
        email: savedSettings.email || '',
        rib: savedSettings.rib || '',
        iban: savedSettings.iban || '',
        bic: savedSettings.bic || ''
      };
    }
  } catch (error) {
    console.error('Error fetching company settings:', error);
  }
  
  return {
    companyName: '',
    siret: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'France',
    phone: '',
    email: '',
    rib: '',
    iban: '',
    bic: ''
  };
};