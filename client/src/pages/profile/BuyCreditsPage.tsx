import { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Header from '@/components/layout/Header';
import { CreditCard, Check, AlertCircle, Info } from 'lucide-react';

// Pacchetti di credito predefiniti
const CREDIT_PACKAGES = [
  { id: 'basic', name: 'Base', credits: 100, price: 5.99 },
  { id: 'standard', name: 'Standard', credits: 300, price: 14.99 },
  { id: 'premium', name: 'Premium', credits: 700, price: 29.99 },
];

// Pagina principale per l'acquisto di crediti
export default function BuyCreditsPage() {
  const [, navigate] = useLocation();
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]); // Default: pacchetto standard
  const [loading, setLoading] = useState(false);
  
  // Funzione simulata per l'acquisto di crediti (versione dimostrativa)
  const handleDemoCredit = async () => {
    setLoading(true);
    
    try {
      // Simula una chiamata al server per aggiungere crediti in modalità test
      // In un ambiente di produzione reale, questo verrebbe sostituito con una vera integrazione di pagamento
      const response = await apiRequest('POST', '/api/credits/demo-purchase', {
        amount: selectedPackage.credits,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Si è verificato un errore durante l\'aggiunta dei crediti');
      }
      
      toast({
        title: 'Crediti aggiunti',
        description: `Hai ricevuto ${selectedPackage.credits} crediti in modalità demo!`,
      });
      
      // Aggiorna i dati dell'utente per mostrare i nuovi crediti
      await refetchUser();
      
      // Rimanda alla pagina del profilo dopo un breve ritardo
      setTimeout(() => navigate('/profile'), 1500);
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: error.message || 'Si è verificato un errore',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Se l'utente non è autenticato, non dovrebbe accedere a questa pagina
  if (!user) {
    return null;
  }

  return (
    <div className="pb-20">
      <Header 
        title="Acquista Crediti" 
        showBackButton={true} 
        backDestination="/profile" 
      />
      
      <div className="px-4 py-6">
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-500" />
          <AlertTitle>Versione dimostrativa</AlertTitle>
          <AlertDescription>
            Il sistema di pagamento è in modalità demo. I crediti saranno aggiunti automaticamente senza addebito reale.
          </AlertDescription>
        </Alert>
        
        <h2 className="text-2xl font-bold mb-6">Scegli un pacchetto</h2>
        
        <Tabs defaultValue={selectedPackage.id} onValueChange={(value) => {
          const pkg = CREDIT_PACKAGES.find(p => p.id === value);
          if (pkg) setSelectedPackage(pkg);
        }}>
          <TabsList className="grid grid-cols-3 mb-6">
            {CREDIT_PACKAGES.map((pkg) => (
              <TabsTrigger key={pkg.id} value={pkg.id}>
                {pkg.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {CREDIT_PACKAGES.map((pkg) => (
            <TabsContent key={pkg.id} value={pkg.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{pkg.credits} Crediti</span>
                    <span className="text-primary font-bold">€{pkg.price.toFixed(2)}</span>
                  </CardTitle>
                  <CardDescription>
                    Pacchetto {pkg.name.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center">
                    <Check className="text-green-500 mr-2 h-5 w-5" />
                    <span>Disponibili immediatamente</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-green-500 mr-2 h-5 w-5" />
                    <span>Utilizzabili per tutti i tipi di scommesse</span>
                  </div>
                  {pkg.id === 'premium' && (
                    <div className="flex items-center">
                      <Check className="text-green-500 mr-2 h-5 w-5" />
                      <span>Bonus del 15% sui crediti</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Ottieni Crediti (Demo)
                  </CardTitle>
                  <CardDescription>
                    In questa versione demo, puoi ottenere crediti senza un vero pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleDemoCredit}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {loading ? 'Elaborazione...' : `Ottieni ${pkg.credits} crediti`}
                  </Button>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  Sistema dimostrativo - Nessun addebito reale viene effettuato
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}