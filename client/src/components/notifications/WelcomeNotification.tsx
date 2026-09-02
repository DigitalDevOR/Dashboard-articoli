import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Award, Calendar, Trophy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Tournament, Prediction } from '@/lib/types';
import { useLocation } from 'wouter';

export function WelcomeNotification() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [notificationSeen, setNotificationSeen] = useState(false);
  
  // Controlla se è il primo accesso della sessione
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('welcomeNotificationSeen');
    if (user && !hasSeenWelcome) {
      // Mostra la notifica solo dopo un breve ritardo per migliorare UX
      const timer = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem('welcomeNotificationSeen', 'true');
        setNotificationSeen(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [user]);
  
  // Fetch degli ultimi dati dell'utente
  const { data: activeTournaments } = useQuery<Tournament[]>({
    queryKey: ['/api/user/tournaments'],
    enabled: !!user && open,
  });
  
  // Fetch delle previsioni dell'utente
  const { data: predictions } = useQuery<Prediction[]>({
    queryKey: ['/api/predictions/me'],
    enabled: !!user && open,
  });
  
  const hasActiveTournaments = activeTournaments && activeTournaments.length > 0;
  const hasPendingPredictions = predictions && predictions.some(p => p.match?.status === 'upcoming');
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Bentornato, {user?.fullName?.split(' ')[0] || 'Campione'}!
          </DialogTitle>
          <DialogDescription className="text-center">
            Ecco un riepilogo delle tue attività
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          {hasActiveTournaments && (
            <div className="flex items-start p-3 bg-blue-50 rounded-lg">
              <Trophy className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Tornei in corso</h3>
                <p className="text-sm text-gray-600">
                  Hai {activeTournaments.length} torneo/i attivo/i. Continua a fare previsioni per scalare la classifica!
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="px-0 text-blue-600"
                  onClick={() => {
                    setOpen(false);
                    navigate('/tournaments');
                  }}
                >
                  Vai ai tornei
                </Button>
              </div>
            </div>
          )}
          
          {hasPendingPredictions && (
            <div className="flex items-start p-3 bg-amber-50 rounded-lg">
              <Calendar className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Pronostici in attesa</h3>
                <p className="text-sm text-gray-600">
                  Hai pronostici in attesa di risultato. Controlla lo stato nella sezione Storico.
                </p>
                <Button
                  variant="link"
                  size="sm" 
                  className="px-0 text-amber-600"
                  onClick={() => {
                    setOpen(false);
                    navigate('/history');
                  }}
                >
                  Controlla pronostici
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex items-start p-3 bg-green-50 rounded-lg">
            <Award className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Saldo attuale</h3>
              <p className="text-sm text-gray-600">
                Il tuo saldo attuale è di <strong>{user?.credits || 0}</strong> crediti.
              </p>
              <Button
                variant="link"
                size="sm"
                className="px-0 text-green-600"
                onClick={() => {
                  setOpen(false);
                  navigate('/buy-credits');
                }}
              >
                Acquista crediti
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-center">
          <Button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full"
          >
            Inizia a giocare
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}