import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { quotesService, clientsService } from '@/lib/firebase-service';
import { useToast } from '@/hooks/use-toast';

export function FirebaseTest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const testFirebaseConnection = async () => {
    try {
      setIsLoading(true);
      console.log('=== FIREBASE TEST START ===');
      
      // Test 1: Check authentication
      console.log('User auth status:', {
        user,
        isAuthenticated: !!user,
        userId: user?.id
      });
      
      if (!user?.id) {
        throw new Error('Utilisateur non authentifié');
      }
      
      // Test 2: Try to read data (should work with basic rules)
      console.log('Testing read operations...');
      const clients = await clientsService.getAll(user.id);
      console.log('Clients read successfully:', clients.length, 'clients found');
      
      // Test 3: Try to create a simple test quote
      console.log('Testing write operations...');
      const testQuoteData = {
        userId: user.id,
        clientId: 1, // Test with a simple ID
        number: `TEST-${Date.now()}`,
        status: 'brouillon' as const,
        issueDate: new Date(),
        validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        subtotal: 100,
        vatAmount: 20,
        total: 120,
        notes: 'Test quote for Firebase debugging',
        termsConditions: 'Test terms'
      };
      
      console.log('Creating test quote with data:', testQuoteData);
      const newQuoteId = await quotesService.create(testQuoteData);
      console.log('Test quote created successfully with ID:', newQuoteId);
      
      toast({
        title: 'Test réussi',
        description: `Firebase fonctionne correctement. Quote créé avec l'ID: ${newQuoteId}`,
      });
      
      console.log('=== FIREBASE TEST SUCCESS ===');
      
    } catch (error) {
      console.error('=== FIREBASE TEST FAILED ===');
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        code: (error as any)?.code,
        details: (error as any)?.details,
        name: (error as any)?.name
      });
      
      toast({
        title: 'Test échoué',
        description: `Erreur Firebase: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50">
        <h3 className="font-semibold text-yellow-800">Test Firebase</h3>
        <p className="text-yellow-700">Vous devez être connecté pour tester Firebase.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-2">Test Firebase</h3>
      <p className="text-sm text-gray-600 mb-4">
        Ce test vérifie si Firebase fonctionne correctement en essayant de lire et créer des données.
      </p>
      <Button 
        onClick={testFirebaseConnection} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Test en cours...' : 'Tester Firebase'}
      </Button>
    </div>
  );
}