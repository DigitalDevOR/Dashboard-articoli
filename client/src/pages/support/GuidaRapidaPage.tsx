import React from 'react';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { ScrollArea } from '@/components/ui/scroll-area';

const GuidaRapidaPage: React.FC = () => {
  return (
    <div className="page-container">
      <Header title="Guida Rapida" showBackButton />

      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto prose">
          <h1 className="mb-6 text-2xl font-bold text-primary">Guida Rapida a Bet Master League</h1>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-primary">Benvenuto nella tua nuova app di pronostici</h2>
            <p className="mb-4 text-gray-700">
              Bet Master League è una piattaforma innovativa che ti permette di partecipare a tornei di pronostici
              sportivi, competere con altri appassionati e vincere premi esclusivi.
            </p>
            <p className="mb-4 text-gray-700">
              La nostra app è progettata per rendere l'esperienza di gioco semplice e divertente,
              indipendentemente dal tuo livello di conoscenza del mondo sportivo.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-primary">Come iniziare</h2>
            <div className="space-y-4">
              <div className="p-4 bg-white border-l-4 rounded-lg border-secondary">
                <h3 className="mb-2 font-medium">1. Iscriviti ai tornei</h3>
                <p className="text-gray-700">
                  Naviga nella sezione "Sport" per scoprire tutti i tornei disponibili.
                  Puoi partecipare gratuitamente o scegliere tornei premium con premi maggiori.
                </p>
              </div>

              <div className="p-4 bg-white border-l-4 rounded-lg border-secondary">
                <h3 className="mb-2 font-medium">2. Fai i tuoi pronostici</h3>
                <p className="text-gray-700">
                  Per ogni partita del torneo, esprimi il tuo pronostico: vittoria casa, pareggio o vittoria trasferta.
                  Puoi modificare i pronostici fino all'inizio della partita.
                </p>
              </div>

              <div className="p-4 bg-white border-l-4 rounded-lg border-secondary">
                <h3 className="mb-2 font-medium">3. Guadagna punti</h3>
                <p className="text-gray-700">
                  Per ogni pronostico corretto guadagnerai punti in base alla difficoltà.
                  I punti si accumulano nella classifica del torneo.
                </p>
              </div>

              <div className="p-4 bg-white border-l-4 rounded-lg border-secondary">
                <h3 className="mb-2 font-medium">4. Vinci premi</h3>
                <p className="text-gray-700">
                  Al termine del torneo, i giocatori con più punti riceveranno premi in crediti
                  da utilizzare per accedere a tornei esclusivi.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-primary">Funzionalità principali</h2>
            <ul className="pl-6 space-y-2 text-gray-700 list-disc">
              <li><strong>Tornei gratuiti e premium</strong>: Scegli tra diversi tipi di competizioni</li>
              <li><strong>Classifiche in tempo reale</strong>: Monitora la tua posizione durante il torneo</li>
              <li><strong>Notifiche</strong>: Ricevi aggiornamenti sui risultati e nuovi tornei</li>
              <li><strong>Sistema di inviti</strong>: Porta i tuoi amici su Bet Master League e guadagna bonus</li>
              <li><strong>Badge e trofei</strong>: Sblocca riconoscimenti speciali con le tue vittorie</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-primary">Consigli per vincere</h2>
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <ul className="pl-6 space-y-2 text-gray-700 list-disc">
                <li>Segui regolarmente le notizie sportive per restare aggiornato</li>
                <li>Analizza le statistiche delle squadre prima di fare un pronostico</li>
                <li>Fai attenzione ai tornei con meno partecipanti per aumentare le probabilità di vincita</li>
                <li>Partecipa a più tornei contemporaneamente per diversificare le chance</li>
                <li>Invita amici per guadagnare crediti bonus utilizzabili nei tornei premium</li>
              </ul>
            </div>
          </section>
        </div>
      </ScrollArea>

      <BottomNavigation activeItem="home" />
    </div>
  );
};

export default GuidaRapidaPage;