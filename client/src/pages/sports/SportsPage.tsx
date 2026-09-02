import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Tournament, Match } from '@/lib/types';
import { getLeagueIcon, formatTime } from '@/lib/utils';
import MatchCard from '@/components/common/MatchCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export default function SportsPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('matches');

  // Fetch all tournaments from Express backend
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
  });

  // Fetch paid tournaments from Express backend
  const { data: paidTournaments, isLoading: paidTournamentsLoading } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments/paid'],
  });

  // Fetch upcoming matches from Sportmonks API via Express backend
  const { data: upcomingMatches, isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ['/api/sportsmonk/fixtures/upcoming'],
  });

  const handleMatchClick = (matchId: string) => {
    setLocation(`/matches/${matchId}`);
  };

  return (
    <div className="page-container bg-neutral-50">
      <Header title="Sport" showMenu={true} />
      
      <Tabs defaultValue="matches" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 sticky top-0 z-10 bg-white p-0 h-auto">
          <TabsTrigger value="matches" className="py-3 font-medium">
            Partite
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="py-3 font-medium">
            Tornei
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="matches" className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-primary">Partite di Oggi</h2>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs"
              onClick={() => setLocation('/matches/calendar')}
            >
              Vedi Calendario
            </Button>
          </div>
          
          {matchesLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white h-24 rounded-lg"></div>
              ))}
            </div>
          ) : upcomingMatches && upcomingMatches.length > 0 ? (
            <div className="space-y-3">
              {upcomingMatches.map((match) => (
                <div 
                  key={match._id || match.id} 
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                  onClick={() => handleMatchClick(match._id || match.id || '')}
                >
                  <MatchCard match={match} />
                </div>
              ))}
              
              <div className="text-center mt-4">
                <Button 
                  variant="outline" 
                  className="text-primary"
                  onClick={() => setLocation('/matches')}
                >
                  Visualizza tutte
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 bg-white rounded-lg shadow-sm">
              <i className="ri-football-line text-3xl text-gray-300 mb-2"></i>
              <p>Nessuna partita disponibile al momento</p>
              <p className="text-sm mt-1">Riprova più tardi</p>
            </div>
          )}
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Quote Popolari</h2>
            
            <div className="grid grid-cols-2 gap-3">
              {['Serie A', 'Premier League', 'Champions League', 'Liga'].map((league) => (
                <div
                  key={league}
                  className="bg-white p-3 rounded-lg shadow-sm flex flex-col items-center cursor-pointer"
                  onClick={() => setLocation(`/leagues/${league.replace(' ', '-').toLowerCase()}`)}
                >
                  <i className={`${getLeagueIcon(league)} text-2xl text-primary mb-1`}></i>
                  <span className="text-sm font-medium">{league}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="tournaments" className="p-4">
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="mb-4 bg-gray-100">
              <TabsTrigger value="available" className="text-sm">Tornei Disponibili</TabsTrigger>
              <TabsTrigger value="joined" className="text-sm">I Miei Tornei</TabsTrigger>
            </TabsList>
            
            <TabsContent value="available" className="space-y-6">
              <h2 className="text-lg font-semibold text-primary mb-4">Tornei Gratuiti</h2>
              
              {tournamentsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white h-48 rounded-lg"></div>
                  ))}
                </div>
              ) : tournaments && tournaments.length > 0 ? (
                <div className="space-y-4">
                  {tournaments.filter(t => !t.isPaid).map((tournament) => (
                    <div key={tournament._id || tournament.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center p-4">
                        <h3 className="text-lg font-bold text-white text-center">{tournament.name}</h3>
                      </div>
                      
                      <div className="p-4">
                        <p className="text-sm text-gray-600 mb-4">{tournament.description || `Partecipa al torneo di ${tournament.league} e vinci crediti!`}</p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <span className="text-xs text-gray-500 block">Data Inizio</span>
                            <span className="text-sm font-medium">{new Date(tournament.startDate).toLocaleDateString('it-IT')}</span>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <span className="text-xs text-gray-500 block">Data Fine</span>
                            <span className="text-sm font-medium">{new Date(tournament.endDate).toLocaleDateString('it-IT')}</span>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <span className="text-xs text-gray-500 block">Partecipanti</span>
                            <span className="text-sm font-medium">{tournament.participants}</span>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <span className="text-xs text-gray-500 block">Premio</span>
                            <span className="text-sm font-medium">{tournament.prize || 100} crediti</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full btn-primary"
                          onClick={() => setLocation(`/tournaments/${tournament._id || tournament.id}`)}
                        >
                          Iscriviti
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-white rounded-lg shadow-sm">
                  <i className="ri-trophy-line text-3xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500">Nessun torneo disponibile al momento</p>
                </div>
              )}
              
              <h2 className="text-lg font-semibold text-primary mb-4">Tornei a Pagamento</h2>
              
              {paidTournamentsLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white h-48 rounded-lg"></div>
                  ))}
                </div>
              ) : paidTournaments && paidTournaments.length > 0 ? (
                <div className="space-y-4">
                  {paidTournaments.map((tournament) => (
                    <div key={tournament._id || tournament.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="h-24 bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center p-4 relative">
                        <span className="absolute top-2 right-2 text-xs px-2 py-1 bg-white text-yellow-700 font-semibold rounded-full">
                          Premium
                        </span>
                        <h3 className="text-lg font-bold text-white text-center">{tournament.name}</h3>
                      </div>
                      
                      <div className="p-4">
                        <p className="text-sm text-gray-600 mb-4">{tournament.description || `Torneo premium con montepremi elevato. Partecipa e sfida i migliori!`}</p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <span className="text-xs text-gray-500 block">Data Inizio</span>
                            <span className="text-sm font-medium">{new Date(tournament.startDate).toLocaleDateString('it-IT')}</span>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <span className="text-xs text-gray-500 block">Data Fine</span>
                            <span className="text-sm font-medium">{new Date(tournament.endDate).toLocaleDateString('it-IT')}</span>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <span className="text-xs text-gray-500 block">Costo Iscrizione</span>
                            <span className="text-sm font-medium">{tournament.entryFee || 50} crediti</span>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <span className="text-xs text-gray-500 block">Premio</span>
                            <span className="text-sm font-medium">{tournament.prize || 500} crediti</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full btn-primary"
                          onClick={() => setLocation(`/tournaments/${tournament._id || tournament.id}`)}
                        >
                          Iscriviti con {tournament.entryFee || 50} crediti
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-white rounded-lg shadow-sm">
                  <i className="ri-vip-crown-line text-3xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500">Nessun torneo premium disponibile al momento</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="joined" className="space-y-4">
              <h2 className="text-lg font-semibold text-primary mb-4">I Miei Tornei</h2>
              
              {/* Per ora mostriamo un messaggio di placeholder, in futuro qui andrà la lista dei tornei a cui l'utente è iscritto */}
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <i className="ri-trophy-line text-5xl text-gray-300 mb-3"></i>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Non sei iscritto a nessun torneo</h3>
                <p className="text-gray-500 max-w-xs mx-auto mb-6">Iscriviti ad un torneo dalla sezione "Tornei Disponibili" per iniziare a fare previsioni!</p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const element = document.querySelector('[data-value="available"]') as HTMLElement;
                    if (element) element.click();
                  }}
                >
                  Vedi Tornei Disponibili
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
      
      <BottomNavigation activeItem="sport" />
    </div>
  );
}
