import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Match } from '@/lib/types';
import { formatTime, getLeagueIcon } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SchedinaSidebar } from '@/components/betting/SchedinaSidebar';
import { BonusBookmakers } from '@/components/betting/BonusBookmakers';

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showTournamentDialog, setShowTournamentDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<'home' | 'draw' | 'away' | null>(null);
  const [showSchedina, setShowSchedina] = useState(false);

  // Fetch upcoming matches
  const { data: matches, isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ['/api/matches/upcoming'],
  });

  // Se ci sono notifiche da mostrare all'accesso
  useEffect(() => {
    if (user) {
      const timeout = setTimeout(() => {
        const notificationShown = sessionStorage.getItem('notification_shown');
        if (!notificationShown) {
          // Mostra notifica occasionale
          toast({
            title: 'Bentornato!',
            description: 'Ci sono nuove partite disponibili per i tuoi pronostici.',
          });
          sessionStorage.setItem('notification_shown', 'true');
        }
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [user, toast]);

  // Raggruppa le partite per campionato
  const leagueSet = new Set<string>();
  if (matches) {
    matches.forEach(match => leagueSet.add(match.league));
  }
  const leagues = Array.from(leagueSet);

  // Funzione per aggiungere un pronostico alla schedina
  const addBetToSchedina = (match: Match, outcome: 'home' | 'draw' | 'away') => {
    const bet = {
      matchId: match._id.toString(),
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      startTime: match.startTime,
      status: match.status,
      odds: outcome === 'home' ? match.homeOdds : outcome === 'draw' ? match.drawOdds : match.awayOdds,
      outcome: outcome === 'home' ? '1' : outcome === 'draw' ? 'X' : '2',
      bookmaker: 'Bet Master'
    };
    
    // Apri la schedina e aggiungi la scommessa
    setShowSchedina(true);
    window.dispatchEvent(new CustomEvent('add-bet', { detail: bet }));
    
    // Feedback all'utente
    toast({
      title: 'Pronostico aggiunto',
      description: `${bet.homeTeam} vs ${bet.awayTeam}: ${bet.outcome}`
    });
  };
  
  // Gestisci click sulle quote
  const handleOddsClick = (match: Match, outcome: 'home' | 'draw' | 'away') => {
    setSelectedMatch(match);
    setSelectedOutcome(outcome);
    
    if (!user) {
      // Utente guest: mostra dialog per registrarsi
      setShowLoginDialog(true);
      return;
    }
    
    // Controlla se l'utente è iscritto al torneo - questa verifica è ora dinamica
    // Dobbiamo verificare se l'utente è iscritto al torneo legato alla partita
    if (match.tournamentId) {
      // Eseguiamo una verifica immediata con una chiamata API
      fetch(`/api/tournaments/${match.tournamentId}/participants/me`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Utente non iscritto al torneo');
          }
          return res.json();
        })
        .then(isParticipating => {
          if (!isParticipating) {
            // Utente loggato ma non iscritto al torneo
            setShowTournamentDialog(true);
          } else {
            // Utente loggato e iscritto: aggiungi alla schedina
            addBetToSchedina(match, outcome);
          }
        })
        .catch(err => {
          console.error('Errore nella verifica della partecipazione:', err);
          // In caso di errore, presumi che l'utente non sia iscritto
          setShowTournamentDialog(true);
        });
      return;
    }
    
    // Se la partita non è associata a un torneo, aggiungi direttamente alla schedina
    addBetToSchedina(match, outcome);
  };

  return (
    <div className="page-container bg-neutral-50 w-full">
      <Header showLogo={true} showMenu={true} />
      
      <div className="p-4 page-content">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-primary">Calendario Partite</h1>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.dispatchEvent(new CustomEvent('open-schedina'))}
            className="flex items-center"
          >
            <i className="ri-bill-line mr-2"></i>
            Schedina
          </Button>
        </div>
        
        <Tabs defaultValue={leagues[0] || 'all'} className="w-full">
          <TabsList className="w-full flex overflow-x-auto pb-1 mb-4 bg-transparent">
            {leagues.map(league => (
              <TabsTrigger 
                key={league} 
                value={league}
                className="flex-shrink-0 flex items-center gap-2 bg-white"
              >
                <i className={`${getLeagueIcon(league)} text-sm`}></i>
                <span>{league}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {leagues.map(league => (
            <TabsContent key={league} value={league} className="space-y-3">
              <h2 className="font-semibold text-gray-700 mb-3">{league}</h2>
              
              {matchesLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-lg h-24"></div>
                  ))}
                </div>
              ) : matches && matches.filter(m => m.league === league).length > 0 ? (
                matches.filter(m => m.league === league).map(match => (
                  <div key={match._id} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">{match.league}</span>
                      <span className="text-xs font-semibold text-gray-700">
                        {formatTime(new Date(match.startTime))}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2">
                      <div className="col-span-3">
                        <div className="flex items-center mb-2">
                          <i className={`${getLeagueIcon(match.league)} mr-2 text-primary`}></i>
                          <span className="text-sm font-medium">{match.homeTeam}</span>
                        </div>
                        <div className="flex items-center">
                          <i className={`${getLeagueIcon(match.league)} mr-2 text-primary opacity-50`}></i>
                          <span className="text-sm font-medium">{match.awayTeam}</span>
                        </div>
                      </div>
                      
                      <div className="col-span-2 grid grid-cols-3 gap-1">
                        <button 
                          className="p-3 bg-gray-100 rounded text-center hover:bg-blue-50 transition-colors"
                          onClick={() => handleOddsClick(match, 'home')}
                        >
                          <div className="text-xs text-gray-500">1</div>
                          <div className="text-sm font-semibold">{match.homeOdds?.toFixed(2)}</div>
                        </button>
                        
                        <button 
                          className="p-3 bg-gray-100 rounded text-center hover:bg-blue-50 transition-colors"
                          onClick={() => handleOddsClick(match, 'draw')}
                        >
                          <div className="text-xs text-gray-500">X</div>
                          <div className="text-sm font-semibold">{match.drawOdds?.toFixed(2)}</div>
                        </button>
                        
                        <button 
                          className="p-3 bg-gray-100 rounded text-center hover:bg-blue-50 transition-colors"
                          onClick={() => handleOddsClick(match, 'away')}
                        >
                          <div className="text-xs text-gray-500">2</div>
                          <div className="text-sm font-semibold">{match.awayOdds?.toFixed(2)}</div>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500">Nessuna partita disponibile per {league}</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
        
        {/* Bonus Bookmakers - Sempre visibile sotto le partite */}
        <div className="mt-6">
          <BonusBookmakers />
        </div>
      </div>
      
      {/* Usiamo solo la schedina globale */}
      
      {/* Modal per utenti non loggati */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrati per fare pronostici</DialogTitle>
            <DialogDescription>
              Per fare pronostici su questa partita devi avere un account. Registrati o accedi per iniziare.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-6">
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
              Annulla
            </Button>
            <Button onClick={() => setLocation("/auth/login")}>
              Accedi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal per utenti non iscritti al torneo */}
      <Dialog open={showTournamentDialog} onOpenChange={setShowTournamentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iscriviti al torneo</DialogTitle>
            <DialogDescription>
              Per fare pronostici su questa partita devi essere iscritto al torneo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-6">
            <Button variant="outline" onClick={() => setShowTournamentDialog(false)}>
              Annulla
            </Button>
            <Button onClick={() => {
              if (selectedMatch?.tournamentId) {
                setLocation(`/tournaments/${selectedMatch.tournamentId}`);
              }
              setShowTournamentDialog(false);
            }}>
              Iscriviti al torneo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <BottomNavigation activeItem="home" />
    </div>
  );
}
