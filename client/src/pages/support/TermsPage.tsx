import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';

export default function TermsPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="page-container bg-neutral-50">
      <Header 
        showLogo={false} 
        title="Termini e Condizioni" 
        leftElement={
          <Button variant="ghost" size="icon" onClick={() => setLocation('/auth/register')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        }
      />
      
      <div className="p-4 overflow-auto">
        <div className="prose max-w-none">
          <h1>Termini e Condizioni di Bet Master League</h1>
          
          <p>Ultimo aggiornamento: 5 Maggio 2025</p>
          
          <h2>1. Introduzione</h2>
          <p>
            Benvenuti su Bet Master League. Questi Termini e Condizioni regolano il vostro utilizzo dell'applicazione Bet Master League, inclusi i servizi correlati. Utilizzando la nostra applicazione, accettate di rispettare i seguenti termini. Vi preghiamo di leggerli attentamente prima di utilizzare l'applicazione.
          </p>
          
          <h2>2. Accettazione dei Termini</h2>
          <p>
            Utilizzando Bet Master League, accettate di essere vincolati da questi Termini e Condizioni. Se non accettate questi termini, non utilizzate l'applicazione.
          </p>
          
          <h2>3. Requisiti di Età</h2>
          <p>
            Per utilizzare Bet Master League, dovete avere almeno 18 anni. L'uso dell'applicazione da parte di minori è strettamente proibito.
          </p>
          
          <h2>4. Account Utente</h2>
          <p>
            Per utilizzare alcune funzionalità di Bet Master League, potrebbe essere necessario creare un account. Siete responsabili di mantenere la riservatezza delle vostre credenziali e di tutte le attività che si verificano sotto il vostro account.
          </p>
          
          <h2>5. Pronostici e Tornei</h2>
          <p>
            Bet Master League offre la possibilità di partecipare a tornei di pronostici sportivi. Queste attività sono puramente a scopo di intrattenimento e non costituiscono scommesse reali. I crediti virtuali utilizzati nell'applicazione non hanno valore monetario.
          </p>
          
          <h2>6. Comportamento dell'Utente</h2>
          <p>
            Gli utenti sono tenuti a comportarsi in modo rispettoso e a non utilizzare l'applicazione per scopi illeciti o per molestare altri utenti.
          </p>
          
          <h2>7. Modifiche ai Termini</h2>
          <p>
            Ci riserviamo il diritto di modificare questi Termini in qualsiasi momento. Le modifiche diventeranno effettive immediatamente dopo la pubblicazione sull'applicazione. L'uso continuato dell'applicazione dopo tali modifiche costituisce accettazione dei nuovi Termini.
          </p>
          
          <h2>8. Limitazione di Responsabilità</h2>
          <p>
            Bet Master League fornisce l'applicazione "così com'è" e "come disponibile" senza garanzie di alcun tipo, espresse o implicite.
          </p>
          
          <h2>9. Legge Applicabile</h2>
          <p>
            Questi Termini sono regolati dalle leggi italiane. Qualsiasi controversia relativa a questi Termini sarà di competenza esclusiva dei tribunali italiani.
          </p>
          
          <h2>10. Contatti</h2>
          <p>
            Per domande riguardanti questi Termini, contattare support@betmasterleague.com.
          </p>
          
          <div className="mt-8 flex justify-center">
            <Button onClick={() => setLocation('/auth/register')}>
              Ho compreso
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}