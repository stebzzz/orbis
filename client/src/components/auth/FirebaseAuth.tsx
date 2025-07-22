import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock } from "lucide-react";



export function FirebaseAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };





  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 p-4">
      <Card className="w-full max-w-md border border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">Orbis</CardTitle>
          <CardDescription className="text-slate-400">
            Connexion à votre espace de gestion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            
            <div className="space-y-4 pt-4">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>
            </div>
          </div>
          
          <div className="mt-6 text-center text-xs text-slate-400">
            <p>Contactez l'administrateur si vous avez besoin d'un accès.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}