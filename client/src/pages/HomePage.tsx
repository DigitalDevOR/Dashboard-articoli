import React from 'react';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import CalendarioPartite from './calendarioPartite';
import Bookmakers from '../components/ui/bookmakers';


export default function HomePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Se ci sono notifiche da mostrare all'accesso
  useEffect(() => {
    if (user) {
      const timeout = setTimeout(() => {
        const notificationShown = sessionStorage.getItem('notification_shown');
        if (!notificationShown) {
          // Mostra notifica occasionale
          toast({
            title: 'Bentornato!',
            description: 'Ci sono nuove partite disponibili per i tuoi pronostici.',
          });
          sessionStorage.setItem('notification_shown', 'true');
        }
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [user, toast]);

  return (
    <div className=" page-container bg-neutral-50">
      <Header showLogo={true} showMenu={true} />

      <div className="page-content">
        <div className="flex items-center justify-between mb-4">
          <CalendarioPartite></CalendarioPartite>
        </div>
      </div>

      <div className='p-4 mt-4 page-content'>
        <Bookmakers />
      </div>

      {/* Modal per utenti non loggati */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrati per fare pronostici</DialogTitle>
            <DialogDescription>
              Per fare pronostici su questa partita devi avere un account. Registrati o accedi per iniziare.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
              Annulla
            </Button>
            <Button onClick={() => setLocation("/auth/login")}>
              Accedi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation activeItem="home" />
    </div>
  );
}
