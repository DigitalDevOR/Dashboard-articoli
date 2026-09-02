import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGuestRedirect } from './GuestRedirect';
import { GuestRedirect } from './GuestRedirect';

/**
 * Utility to show a notification if a user is not authorized to access a feature
 */
export default function GuestCheck({ 
  children, 
  showNotificationFor = ['tournaments', 'notifications', 'profile'] 
}: { 
  children: React.ReactNode,
  showNotificationFor?: string[]
}) {
  const { user } = useAuth();
  const { isDialogOpen, showAuthDialog, closeAuthDialog } = useGuestRedirect();
  
  // Check current location for restricted features
  useEffect(() => {
    if (!user) {
      const currentPath = window.location.pathname;
      const shouldShowNotification = showNotificationFor.some(path => 
        currentPath.includes(path)
      );
      
      if (shouldShowNotification) {
        showAuthDialog();
      }
    }
  }, [user, showNotificationFor, showAuthDialog]);

  return (
    <>
      {children}
      <GuestRedirect isOpen={isDialogOpen} onClose={closeAuthDialog} />
    </>
  );
}

/**
 * Hook per controllare se l'utente ha accesso a certe funzionalità
 */
export function useGuestCheck() {
  const { user } = useAuth();
  const { showAuthDialog } = useGuestRedirect();
  
  const checkAccess = (feature: string, callback?: () => void) => {
    if (!user) {
      showAuthDialog();
      return false;
    }
    
    if (callback) {
      callback();
    }
    
    return true;
  };
  
  return {
    checkAccess,
    isLoggedIn: !!user
  };
}