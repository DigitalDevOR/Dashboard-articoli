import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';

export default function PrivacyPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="page-container bg-neutral-50">
      <Header 
        showLogo={false} 
        title="Informativa sulla Privacy" 
        leftElement={
          <Button variant="ghost" size="icon" onClick={() => setLocation('/auth/register')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        }
      />
      
      <div className="p-4 overflow-auto">
        <div className="prose max-w-none">
          <h1>Informativa sulla Privacy di Bet Master League</h1>
          
          <p>Ultimo aggiornamento: 5 Maggio 2025</p>
          
          <h2>1. Introduzione</h2>
          <p>
            La presente Informativa sulla Privacy descrive come Bet Master League raccoglie, utilizza e condivide i dati personali quando utilizzate la nostra applicazione.
          </p>
          
          <h2>2. Dati Raccolti</h2>
          <p>
            Raccogliamo diversi tipi di informazioni, tra cui:
          </p>
          <ul>
            <li>Informazioni personali (nome, email, username)</li>
            <li>Informazioni sul dispositivo e sull'utilizzo dell'app</li>
            <li>Pronostici e partecipazione ai tornei</li>
            <li>Comunicazioni con il nostro team di supporto</li>
          </ul>
          
          <h2>3. Utilizzo dei Dati</h2>
          <p>
            Utilizziamo i dati raccolti per:
          </p>
          <ul>
            <li>Fornire, mantenere e migliorare i nostri servizi</li>
            <li>Gestire account utente e tornei</li>
            <li>Comunicare con gli utenti</li>
            <li>Prevenire attività fraudolente</li>
          </ul>
          
          <h2>4. Condivisione dei Dati</h2>
          <p>
            Non condividiamo le informazioni personali con terze parti, tranne nei seguenti casi:
          </p>
          <ul>
            <li>Con il vostro consenso</li>
            <li>Per adempiere a obblighi legali</li>
            <li>Con fornitori di servizi che ci supportano nella gestione dell'app</li>
          </ul>
          
          <h2>5. Sicurezza dei Dati</h2>
          <p>
            Adottiamo misure tecniche e organizzative per proteggere i vostri dati personali contro accessi non autorizzati, perdita o alterazione.
          </p>
          
          <h2>6. I Vostri Diritti</h2>
          <p>
            Avete il diritto di:
          </p>
          <ul>
            <li>Accedere ai vostri dati personali</li>
            <li>Rettificare informazioni inesatte</li>
            <li>Richiedere la cancellazione dei vostri dati</li>
            <li>Opporvi al trattamento dei vostri dati</li>
            <li>Richiedere la limitazione del trattamento</li>
          </ul>
          
          <h2>7. Cookie e Tecnologie Simili</h2>
          <p>
            Utilizziamo cookie e tecnologie simili per raccogliere informazioni sull'uso dell'app e migliorare l'esperienza utente.
          </p>
          
          <h2>8. Modifiche alla Privacy Policy</h2>
          <p>
            Possiamo aggiornare questa Informativa sulla Privacy periodicamente. Vi informeremo di eventuali modifiche pubblicando la nuova Informativa sulla Privacy sull'app.
          </p>
          
          <h2>9. Contatti</h2>
          <p>
            Per domande sulla Privacy Policy, contattare privacy@betmasterleague.com.
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