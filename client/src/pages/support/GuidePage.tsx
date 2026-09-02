import { FC } from 'react';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/hooks/useAuth';

interface GuidePageProps {
  showHamburgerMenu?: boolean;
  backDestination?: string;
}

const GuidePage: FC<GuidePageProps> = ({
  showHamburgerMenu,
  backDestination = "/"
}) => {
  const { user } = useAuth();

  // Se showHamburgerMenu non è definito, mostralo solo se l'utente è autenticato
  const shouldShowMenu = showHamburgerMenu !== undefined ? showHamburgerMenu : !!user;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Header
        title=""
        showBackButton
        showMenu={shouldShowMenu}
        backDestination={backDestination}
      />

      <motion.div
        className="flex-1 p-4 overflow-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-5 mb-6 bg-white rounded-lg shadow-sm">
          <h1 className="mb-3 text-xl font-semibold text-gray-800">Benvenuto in BetMaster League</h1>
          <p className="text-gray-600">
            Questa guida rapida ti spiegherà le funzionalità principali dell'app
            e come usarla al meglio per goderti l'esperienza.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          <AccordionItem value="item-1" className="bg-white border-none rounded-lg shadow-sm">
            <AccordionTrigger className="px-5 py-3 rounded-lg hover:no-underline hover:bg-gray-50">
              <div className="flex items-center gap-3 text-left">
                <span className="font-medium text-primary">1.</span>
                <span>Come iniziare</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pt-1 pb-4">
              <p className="mb-3 text-gray-600">
                Per utilizzare BetMaster League, devi prima registrarti o effettuare il login.
              </p>
              <ul className="pl-5 space-y-2 text-gray-600 list-disc">
                <li>Vai alla schermata di login tramite il pulsante nella sezione profilo</li>
                <li>Registrati fornendo un nome utente, email e password, oppure accedi inserendo le tue credenziali</li>
                <li>Inizia subito a esplorare tornei e partite disponibili</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="bg-white border-none rounded-lg shadow-sm">
            <AccordionTrigger className="px-5 py-3 rounded-lg hover:no-underline hover:bg-gray-50">
              <div className="flex items-center gap-3 text-left">
                <span className="font-medium text-primary">2.</span>
                <span>Partecipare ai tornei</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pt-1 pb-4">
              <p className="mb-3 text-gray-600">
                Puoi partecipare a vari tornei di previsione sportiva:
              </p>
              <ul className="pl-5 space-y-2 text-gray-600 list-disc">
                <li>Vai alla sezione "Sport" dal menu di navigazione</li>
                <li>Scegli un torneo attivo e leggi i suoi dettagli</li>
                <li>Clicca su "Partecipa" e conferma la tua iscrizione</li>
                <li>Alcuni tornei sono gratuiti, altri richiedono crediti</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="bg-white border-none rounded-lg shadow-sm">
            <AccordionTrigger className="px-5 py-3 rounded-lg hover:no-underline hover:bg-gray-50">
              <div className="flex items-center gap-3 text-left">
                <span className="font-medium text-primary">3.</span>
                <span>Fare previsioni</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pt-1 pb-4">
              <p className="mb-3 text-gray-600">
                Una volta iscritto a un torneo, puoi fare previsioni sulle partite:
              </p>
              <ul className="pl-5 space-y-2 text-gray-600 list-disc">
                <li>Seleziona una partita disponibile nel torneo</li>
                <li>Visualizza le quote e le statistiche disponibili</li>
                <li>Scegli il risultato che prevedi (casa, pareggio, trasferta)</li>
                <li>Conferma la tua previsione prima dell'inizio della partita</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="bg-white border-none rounded-lg shadow-sm">
            <AccordionTrigger className="px-5 py-3 rounded-lg hover:no-underline hover:bg-gray-50">
              <div className="flex items-center gap-3 text-left">
                <span className="font-medium text-primary">4.</span>
                <span>Il sistema di punteggio</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pt-1 pb-4">
              <p className="mb-3 text-gray-600">
                Ottieni punti quando le tue previsioni sono corrette:
              </p>
              <ul className="pl-5 space-y-2 text-gray-600 list-disc">
                <li>Previsione corretta = punti base + bonus basato sulla quota</li>
                <li>Maggiore è la quota, maggiore sarà il bonus</li>
                <li>In ogni torneo, il punteggio viene calcolato separatamente</li>
                <li>La classifica di ogni torneo mostra i partecipanti ordinati per punteggio</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="bg-white border-none rounded-lg shadow-sm">
            <AccordionTrigger className="px-5 py-3 rounded-lg hover:no-underline hover:bg-gray-50">
              <div className="flex items-center gap-3 text-left">
                <span className="font-medium text-primary">5.</span>
                <span>Crediti e premi</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pt-1 pb-4">
              <p className="mb-3 text-gray-600">
                I crediti ti permettono di partecipare ai tornei a pagamento:
              </p>
              <ul className="pl-5 space-y-2 text-gray-600 list-disc">
                <li>Ricevi crediti gratuiti all'iscrizione</li>
                <li>Puoi acquistare ulteriori crediti</li>
                <li>Vincere i tornei ti permette di guadagnare crediti extra</li>
                <li>I tornei premium offrono premi più consistenti</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.div>

      <BottomNavigation />
    </div>
  );
};

export default GuidePage;