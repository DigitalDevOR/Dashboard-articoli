import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserGuide({ isOpen, onClose }: UserGuideProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Guida Rapida</DialogTitle>
          <DialogDescription>
            Come funziona Bet Master League
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[50vh] mt-4 rounded-md border p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Come funziona Bet Master League</h3>
            <p>
              Benvenuti su Bet Master League, la piattaforma di pronostici sportivi che ti permette di dimostrare la tua conoscenza nel mondo dello sport!
            </p>
            
            <h3 className="text-lg font-medium">1. Registrazione e Login</h3>
            <p>
              Per iniziare, crea un account o accedi se ne hai già uno. Una volta registrato, riceverai un bonus di benvenuto di 100 crediti per iniziare a fare pronostici.
            </p>
            
            <h3 className="text-lg font-medium">2. Navigazione</h3>
            <p>
              Dalla home page puoi visualizzare gli eventi sportivi in corso, i tornei popolari e i tornei speciali. 
              Utilizza la barra di navigazione in basso per spostarti tra le diverse sezioni dell'app.
            </p>
            
            <h3 className="text-lg font-medium">3. Come fare pronostici</h3>
            <p>
              Cerca l'evento sportivo di tuo interesse e fai il tuo pronostico cliccando sulle quote. Potrai scegliere tra vittoria della squadra di casa, 
              pareggio o vittoria della squadra ospite. Ogni pronostico corretto ti farà guadagnare crediti in base alla quota scelta.
            </p>
            
            <h3 className="text-lg font-medium">4. Partecipazione ai tornei</h3>
            <p>
              I tornei sono competizioni speciali in cui puoi mettere alla prova le tue abilità contro altri utenti. 
              Ci sono tornei gratuiti e tornei premium che richiedono un pagamento in crediti. I tornei premium offrono premi più elevati!
            </p>
            
            <h3 className="text-lg font-medium">5. Classifica</h3>
            <p>
              La classifica mostra i migliori pronosticatori della piattaforma. Accumula punti con i tuoi pronostici corretti per scalare la classifica e 
              diventare un vero Master!
            </p>
            
            <h3 className="text-lg font-medium">6. Badge e Premi</h3>
            <p>
              Completando determinate azioni nella piattaforma, potrai guadagnare badge speciali che mostrano il tuo progresso e le tue abilità. 
              Colleziona tutti i badge per dimostrare di essere un vero esperto!
            </p>
            
            <h3 className="text-lg font-medium">7. Invita amici</h3>
            <p>
              Condividi il tuo codice referral con i tuoi amici. Per ogni amico che si registra usando il tuo codice, 
              riceverai un bonus di 100 crediti.
            </p>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-4">
          <Button onClick={onClose}>
            Chiudi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useUserGuide() {
  const [isOpen, setIsOpen] = useState(false);
  
  const openGuide = () => setIsOpen(true);
  const closeGuide = () => setIsOpen(false);
  
  return {
    isOpen,
    openGuide,
    closeGuide,
  };
}