import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Match } from '@/lib/types';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import MatchCard from '@/components/common/MatchCard';
import { SchedinaSidebar } from '@/components/betting/SchedinaSidebar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, ReceiptText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useSchedineStore } from '@/store/useSchedineStore';

interface AllMatchesPageProps {
  league?: string;
}

export default function AllMatchesPage({ league }: AllMatchesPageProps = {}) {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [activeLeague, setActiveLeague] = useState<string>(league || 'all');
  const { user } = useAuth();
  const { toast } = useToast();
  const { openSchedina, bets } = useSchedineStore();
  
  // Imposta la lega attiva quando il parametro league cambia
  useEffect(() => {
    if (league) {
      setActiveLeague(league);
    }
  }, [league]);

  // Fetch all upcoming matches
  const { data: matches, isLoading } = useQuery<Match[]>({
    queryKey: ['/api/matches/upcoming', { limit: 50 }],
  });

  // Filter matches based on search term and active league
  useEffect(() => {
    if (!matches) return;
    
    let filtered = [...matches];
    
    // Filter by league if not 'all'
    if (activeLeague !== 'all') {
      filtered = filtered.filter(match => match.league === activeLeague);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(match => 
        match.homeTeam.toLowerCase().includes(term) || 
        match.awayTeam.toLowerCase().includes(term) ||
        match.league.toLowerCase().includes(term)
      );
    }
    
    setFilteredMatches(filtered);
  }, [matches, searchTerm, activeLeague]);

  // Get unique leagues for tabs
  const leagues = matches ? ['all', ...Array.from(new Set(matches.map(match => match.league)))] : ['all'];

  return (
    <div className="page-container bg-neutral-50">
      <Header 
        showBackButton={true} 
        title="Tutte le Partite"
        backDestination="/sports"
      />
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Cerca squadre o campionati" 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Tabs defaultValue={activeLeague} className="w-full" onValueChange={setActiveLeague}>
              <TabsList className="flex overflow-x-auto space-x-2 bg-transparent h-auto p-0">
                {leagues.map(league => (
                  <TabsTrigger 
                    key={league} 
                    value={league}
                    className="text-xs whitespace-nowrap py-1 px-3"
                  >
                    {league === 'all' ? 'Tutte' : league}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <div className="mt-4">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="bg-white h-24 rounded-lg"></div>
                    ))}
                  </div>
                ) : filteredMatches.length > 0 ? (
                  <div className="space-y-3">
                    {filteredMatches.map((match) => (
                      <div 
                        key={match.id} 
                        className="bg-white rounded-lg shadow-sm overflow-hidden"
                      >
                        <MatchCard 
                          match={match} 
                          onSelectOdds={(type) => {
                            // Aggiungi il pronostico alla schedina
                            const matchId = match.id || match._id;
                            const bet = {
                              matchId: matchId.toString(),
                              homeTeam: match.homeTeam,
                              awayTeam: match.awayTeam,
                              startTime: match.startTime,
                              status: match.status,
                              // Scegli l'odd appropriata in base al tipo di pronostico
                              odds: type === 'home' ? match.homeOdds || 1 : 
                                    type === 'draw' ? match.drawOdds || 1 : 
                                    match.awayOdds || 1,
                              outcome: type === 'home' ? '1' : type === 'draw' ? 'X' : '2',
                              bookmaker: 'Bet Master'
                            };
                            
                            // Controllo se l'utente è autenticato
                            if (!user) {
                              toast({
                                title: 'Accesso richiesto',
                                description: 'Devi accedere per fare pronostici',
                                variant: 'destructive',
                              });
                              return;
                            }
                            
                            // Aggiungi la scommessa usando l'EventBus
                            window.dispatchEvent(new CustomEvent('add-bet', { detail: bet }));
                            
                            // Feedback per l'utente
                            toast({
                              title: 'Pronostico aggiunto',
                              description: `${bet.homeTeam} vs ${bet.awayTeam}: ${bet.outcome}`,
                            });
                            
                            // Apri automaticamente la schedina
                            openSchedina();
                          }}
                          onCompare={() => setLocation(`/matches/${match.id}`)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm">
                    {searchTerm ? (
                      <>
                        <p>Nessuna partita trovata con "{searchTerm}"</p>
                        <p className="text-sm mt-1">Prova con un altro termine di ricerca</p>
                      </>
                    ) : (
                      <>
                        <i className="ri-football-line text-3xl text-gray-300 mb-2"></i>
                        <p>Nessuna partita disponibile</p>
                        <p className="text-sm mt-1">Non ci sono partite programmate in questa categoria</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Tabs>
          </div>
          
          {/* Utilizziamo la schedina globale invece di averne una locale */}
        </div>
      </div>
      
      <BottomNavigation activeItem="sport" />
      
      {/* Utilizziamo il pulsante della schedina globale */}
    </div>
  );
}