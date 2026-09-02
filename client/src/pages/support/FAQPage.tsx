import { FC, useState } from 'react';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQPage: FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: 'Come posso registrarmi da Fantasy League?',
      answer: 'Per registrarsi alla nostra Fantasy League, vai alla schermata di login e seleziona "Registrati". Compila il form con i tuoi dati personali. Clicca su "Registrati" nell\'ultimo passaggio. Accedi inserendo le tue credenziali. Sei pronto a giocare!'
    },
    {
      question: 'Come funziona il sistema di punteggio?',
      answer: 'Il nostro sistema di punteggio assegna punti in base all\'accuratezza delle tue previsioni. Ricevi più punti per previsioni corrette su eventi meno probabili. I punti accumulati determinano la tua posizione in classifica e i premi che puoi vincere alla fine di un torneo.'
    },
    {
      question: 'Quando viene aggiornata la classifica?',
      answer: 'La classifica viene aggiornata in tempo reale dopo la conclusione di ogni partita. Puoi vedere la tua posizione nella sezione "Classifiche" del menu principale. Le classifiche sono divise per tornei e competizioni.'
    },
    {
      question: 'Quali sono i premi disponibili?',
      answer: 'I premi variano in base al torneo. Generalmente, i vincitori ricevono crediti bonus che possono essere utilizzati per partecipare ad altri tornei a pagamento. I tornei premium hanno premi più consistenti rispetto ai tornei gratuiti.'
    },
    {
      question: 'Come posso invitare amici?',
      answer: 'Puoi invitare amici attraverso la sezione "Invita Amici" nel tuo profilo. Condividi il tuo link di referral tramite social media o messaggio diretto. Per ogni amico che si unisce usando il tuo link, riceverai crediti bonus una volta che completeranno la registrazione.'
    },
    {
      question: 'Come faccio a recuperare la password?',
      answer: 'Per recuperare la password, vai alla schermata di login e seleziona "Recupera password". Inserisci l\'email associata al tuo account. Riceverai un link per reimpostare la password. Segui le istruzioni nella mail per creare una nuova password.'
    }
  ];

  const toggleItem = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header showBackButton showMenu title="" />

      <motion.div
        className="flex-1 p-6 overflow-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-4">
          <div className="mb-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50">
              <i className="text-2xl ri-question-line text-primary"></i>
            </div>
            <h1 className="text-xl font-semibold text-center text-gray-800">Domande Frequenti</h1>
          </div>

          {faqItems.map((item, index) => (
            <div
              key={index}
              className="overflow-hidden bg-white border border-gray-200 rounded-lg"
            >
              <button
                className="flex items-center justify-between w-full px-4 py-3 text-left"
                onClick={() => toggleItem(index)}
              >
                <span className="font-medium">{item.question}</span>
                {expandedIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                      <p className="text-sm text-gray-700">{item.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>

      <BottomNavigation />
    </div>
  );
};

export default FAQPage;