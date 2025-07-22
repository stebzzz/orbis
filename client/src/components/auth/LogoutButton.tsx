import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function LogoutButton({ 
  variant = 'ghost', 
  size = 'default', 
  showIcon = true,
  children 
}: LogoutButtonProps) {
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté avec succès.',
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: 'Erreur de déconnexion',
        description: 'Une erreur est survenue lors de la déconnexion.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleLogout}
      className="flex items-center gap-2"
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {children || 'Se déconnecter'}
    </Button>
  );
}