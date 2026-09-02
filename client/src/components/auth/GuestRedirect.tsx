import { useState } from 'react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface GuestRedirectProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuestRedirect({ isOpen, onClose }: GuestRedirectProps) {
  const [, setLocation] = useLocation();
  
  const handleRegister = () => {
    setLocation('/register');
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Accesso richiesto</DialogTitle>
          <DialogDescription>
            Per partecipare ai tornei o fare una previsione devi registrarti. Vuoi creare un account ora?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button onClick={handleRegister}>
            Registrati
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useGuestRedirect() {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const showAuthDialog = () => {
    setIsDialogOpen(true);
  };
  
  const closeAuthDialog = () => {
    setIsDialogOpen(false);
  };
  
  const redirectToAuth = () => {
    setLocation('/login');
  };
  
  return {
    showAuthDialog,
    closeAuthDialog,
    redirectToAuth,
    isDialogOpen,
  };
}