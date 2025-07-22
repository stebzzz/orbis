import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface CompanySettings {
  companyName: string;
  siret: string;
  address?: string;
  postalCode?: string;
  city?: string;
  phone?: string;
  email?: string;
  rib?: string;
  iban?: string;
  bic?: string;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  companySettings?: CompanySettings | null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // Récupérer les informations de base de l'utilisateur
        const userData: AuthUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email || 'Utilisateur',
        };
        
        // Si le displayName contient un espace, on peut extraire prénom et nom
        if (firebaseUser.displayName && firebaseUser.displayName.includes(' ')) {
          const [firstName, ...lastNameParts] = firebaseUser.displayName.split(' ');
          userData.firstName = firstName;
          userData.lastName = lastNameParts.join(' ');
        }
        
        try {
          // Récupérer les paramètres de l'entreprise depuis Firestore
          const companySettingsDoc = await getDoc(doc(db, 'companySettings', firebaseUser.uid));
          
          if (companySettingsDoc.exists()) {
            userData.companySettings = companySettingsDoc.data() as CompanySettings;
          } else {
            userData.companySettings = null;
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des paramètres de l\'entreprise:', error);
          userData.companySettings = null;
        }
        
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
