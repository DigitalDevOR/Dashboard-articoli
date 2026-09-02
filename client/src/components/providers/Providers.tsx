import { ReactNode, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/hooks/useAuth';
import { NotificationProvider } from '@/components/providers/NotificationProvider';
import { Toaster } from '@/components/ui/toaster';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Effetto per gestire l'autenticazione all'avvio dell'app
  useEffect(() => {
    // Il controllo viene fatto in fase di ricaricamento della pagina
    // Se l'utente ha il flag isLoggedIn nel localStorage, forza un refresh delle query di autenticazione
    if (localStorage.getItem('isLoggedIn') === 'true') {
      console.log("🔄 Rivalidazione sessione richiesta - localStorage flag trovato");
      
      // Tenta di recuperare l'utente all'avvio se il flag di login è presente
      queryClient.fetchQuery({ 
        queryKey: ['/api/auth/me'],
        retry: 2
      }).catch(err => {
        console.log("❌ Errore durante la rivalidazione:", err);
        // Rimuovi il flag se non è stato possibile recuperare l'utente
        localStorage.removeItem('isLoggedIn');
      });
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          {children}
          <Toaster />
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
