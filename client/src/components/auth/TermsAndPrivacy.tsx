import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TermsAndPrivacyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsAndPrivacy({ isOpen, onClose }: TermsAndPrivacyProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Termini e Privacy</DialogTitle>
          <DialogDescription>
            Leggi attentamente i nostri termini e condizioni di utilizzo
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[50vh] mt-4 rounded-md border p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">1. Informazioni generali</h3>
            <p>
              Bet Master League è una piattaforma di intrattenimento che offre servizi di pronostici sportivi virtuali senza utilizzo di denaro reale.
              L'uso di questa applicazione è soggetto ai seguenti termini e condizioni.
            </p>
            
            <h3 className="text-lg font-medium">2. Registrazione</h3>
            <p>
              Per utilizzare pienamente i servizi offerti, è necessario registrarsi creando un account. Durante la registrazione, l'utente si impegna a fornire 
              informazioni veritiere e aggiornate. L'accesso è consentito solo a persone maggiorenni (18+).
            </p>
            
            <h3 className="text-lg font-medium">3. Crediti virtuali</h3>
            <p>
              L'applicazione utilizza un sistema di crediti virtuali che non hanno valore monetario reale. I crediti possono essere ottenuti 
              gratuitamente attraverso la partecipazione a pronostici, inviti ad amici e altre attività all'interno dell'app.
            </p>
            
            <h3 className="text-lg font-medium">4. Privacy</h3>
            <p>
              Raccogliamo i seguenti dati personali: nome, email, username. Questi dati vengono utilizzati esclusivamente per 
              fornire i servizi richiesti e migliorare l'esperienza utente. Non condividiamo i tuoi dati con terze parti senza il tuo consenso esplicito.
            </p>
            
            <h3 className="text-lg font-medium">5. Proprietà intellettuale</h3>
            <p>
              Tutti i contenuti presenti sull'applicazione, inclusi logo, design, testi e software, sono di proprietà esclusiva di Bet Master League 
              e sono protetti dalle leggi sulla proprietà intellettuale.
            </p>
            
            <h3 className="text-lg font-medium">6. Modifiche ai termini</h3>
            <p>
              Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. Gli utenti saranno informati di eventuali modifiche 
              tramite notifica sull'applicazione.
            </p>
            
            <h3 className="text-lg font-medium">7. Cancellazione account</h3>
            <p>
              Gli utenti possono richiedere la cancellazione del proprio account in qualsiasi momento attraverso la sezione impostazioni. 
              La cancellazione comporterà l'eliminazione definitiva di tutti i dati personali associati all'account.
            </p>
            
            <h3 className="text-lg font-medium">8. Limitazione di responsabilità</h3>
            <p>
              Bet Master League non è responsabile per eventuali interruzioni del servizio, errori tecnici o perdite di dati che potrebbero verificarsi 
              durante l'utilizzo dell'applicazione.
            </p>
            
            <h3 className="text-lg font-medium">9. Legge applicabile</h3>
            <p>
              Questi termini sono regolati dalle leggi italiane. Qualsiasi controversia sarà soggetta alla giurisdizione esclusiva dei tribunali italiani.
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

export function useTermsAndPrivacy() {
  const [isOpen, setIsOpen] = useState(false);
  
  const openTerms = () => setIsOpen(true);
  const closeTerms = () => setIsOpen(false);
  
  return {
    isOpen,
    openTerms,
    closeTerms,
  };
}