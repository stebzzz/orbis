import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        // Utiliser directement les données Firebase
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email || 'Utilisateur'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
