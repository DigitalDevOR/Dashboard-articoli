import React, { ReactElement } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGuestRedirect, GuestRedirect } from './GuestRedirect';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactElement;
  showDialog?: boolean;
}

/**
 * Un componente wrapper che controlla se l'utente è autenticato
 * Se non è autenticato, mostra un dialogo o reindirizza alla pagina di login
 */
export function ProtectedRoute({ children, showDialog = true }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { isDialogOpen, showAuthDialog, closeAuthDialog } = useGuestRedirect();

  React.useEffect(() => {
    if (!isLoading && !user && showDialog) {
      showAuthDialog();
    }
  }, [isLoading, user, showDialog, showAuthDialog]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-180px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {children}
      <GuestRedirect isOpen={isDialogOpen} onClose={closeAuthDialog} />
    </>
  );
}

/**
 * Hook per proteggere funzionalità all'interno di una pagina
 */
export function useProtectedFeature() {
  const { user } = useAuth();
  const { showAuthDialog, isDialogOpen, closeAuthDialog } = useGuestRedirect();

  const requireAuth = (callback: () => void) => {
    if (user) {
      callback();
    } else {
      showAuthDialog();
    }
  };

  return {
    requireAuth,
    isAuthenticated: !!user,
    isDialogOpen,
    closeAuthDialog,
  };
}