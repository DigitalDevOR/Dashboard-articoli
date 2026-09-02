import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useServiceWorker() {
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(registration => {
            console.log('ServiceWorker registration successful with scope:', registration.scope);
            
            // Check for updates to the Service Worker
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker is installed but waiting to activate
                    toast({
                      title: 'App Update Available',
                      description: 'Refresh the page to use the latest version',
                      duration: 10000,
                      action: (
                        <button 
                          onClick={() => window.location.reload()}
                          className="bg-primary text-white px-3 py-1 rounded-md text-xs"
                        >
                          Refresh Now
                        </button>
                      ),
                    });
                  }
                });
              }
            });
          })
          .catch(error => {
            console.error('ServiceWorker registration failed:', error);
          });
      });
    }
  }, [toast]);
}
