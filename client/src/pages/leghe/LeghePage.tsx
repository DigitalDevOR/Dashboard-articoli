import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Tournament } from '@/lib/types';
import { getLeagueIcon } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { getUserTournamentIds } from '@/mock/mockTournaments';
import { useSchedineStore } from '@/store/useSchedineStore';
import { ReceiptText } from 'lucide-react';

export default function TorneiPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { openSchedina, bets, betHistory } = useSchedineStore();

  // Fetch all tournaments
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
  });

  // Fetch premium tournaments
  const { data: paidTournaments, isLoading: paidTournamentsLoading } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments/paid'],
  });

  // Fetch tournaments the user is participating in
  const { data: myTournaments, isLoading: isMyTournamentsLoading, refetch: refetchMyTournaments } = useQuery<Tournament[]>({
    queryKey: ['/api/user/tournaments'],
    enabled: !!user,
    refetchInterval: 3000, // Riprova ogni 3 secondi
    staleTime: 0, // Considera sempre i dati obsoleti
    refetchOnWindowFocus: true,
    gcTime: 0, // Non conservare i dati obsoleti nella cache
  });
  
  // Forza il refetch dei tornei quando cambiamo a questa scheda
  const handleTabChange = (value: string) => {
    if (value === "joined" && user) {
      console.log("Aggiornamento forzato My Tournaments");
      refetchMyTournaments();
    }
  };
  
  // Override: usa direttamente i dati dal server per massima affidabilità
  const myTournamentsData = myTournaments || [];

  return (
    <div className="page-container bg-neutral-50">
      <Header title="Tornei" showMenu={true} />
      
      <Tabs defaultValue="available" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-2 sticky top-0 z-10 bg-white p-0 h-auto">
          <TabsTrigger value="available" className="py-3 font-medium">
            Tornei Disponibili
          </TabsTrigger>
          <TabsTrigger value="joined" className="py-3 font-medium">
            I Miei Tornei
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="p-4">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-primary mb-4">Tornei Gratuiti</h2>
            
            {tournamentsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Caricamento tornei...</p>
              </div>
            ) : tournaments && tournaments.length > 0 ? (
              <div className="grid gap-3">
                {tournaments.filter(t => !t.isPaid).map(tournament => (
                  <div 
                    key={tournament._id || tournament.id}
                    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer"
                    onClick={() => setLocation(`/tournaments/${tournament._id || tournament.id}`)}
                  >
                    <div className="flex items-center">
                      <div className="rounded-lg bg-blue-50 p-2 mr-4">
                        <i className={`${getLeagueIcon(tournament.league)} text-2xl text-primary`}></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{tournament.name}</h3>
                        <p className="text-sm text-gray-500">{tournament.participants} partecipanti</p>
                      </div>
                      <div className="text-primary">
                        <i className="ri-arrow-right-s-line"></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nessun torneo disponibile</p>
              </div>
            )}
            
            <h2 className="text-lg font-semibold text-primary mb-4 mt-6">Tornei Premium</h2>
            
            {paidTournamentsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Caricamento tornei premium...</p>
              </div>
            ) : paidTournaments && paidTournaments.length > 0 ? (
              <div className="grid gap-3">
                {paidTournaments.map(tournament => (
                  <div 
                    key={tournament._id || tournament.id}
                    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer"
                    onClick={() => setLocation(`/tournaments/${tournament._id || tournament.id}`)}
                  >
                    <div className="flex items-center">
                      <div className="rounded-lg bg-blue-50 p-2 mr-4">
                        <i className={`${getLeagueIcon(tournament.league)} text-2xl text-primary`}></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{tournament.name}</h3>
                        <div className="flex items-center">
                          <i className="ri-coin-line text-yellow-500 mr-1"></i>
                          <span className="text-sm">{tournament.entryFee} crediti</span>
                          {tournament.prize && (
                            <>
                              <span className="text-sm text-gray-400 mx-1">•</span>
                              <i className="ri-trophy-line text-orange-500 mr-1"></i>
                              <span className="text-sm">Premio: {tournament.prize} crediti</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-primary">
                        <i className="ri-arrow-right-s-line"></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nessun torneo premium disponibile al momento</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="joined" className="p-4">
          <h2 className="text-lg font-semibold text-primary mb-4">I Miei Tornei</h2>
          
          {!user ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <i className="ri-lock-line text-5xl text-gray-300 mb-3"></i>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Accesso richiesto</h3>
              <p className="text-gray-500 max-w-xs mx-auto mb-6">Registrati o accedi per visualizzare i tuoi tornei</p>
              <Button 
                variant="default"
                onClick={() => setLocation('/auth/login')}
              >
                Accedi
              </Button>
            </div>
          ) : isMyTournamentsLoading && myTournamentsData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Caricamento tornei...</p>
            </div>
          ) : myTournamentsData.length > 0 ? (
            <div className="grid gap-3">
              {myTournamentsData.map((tournament: Tournament) => (
                <div 
                  key={tournament._id || tournament.id}
                  className="bg-white rounded-lg shadow-sm p-4 cursor-pointer"
                  onClick={() => setLocation(`/tournaments/${tournament._id || tournament.id}`)}
                >
                  <div className="flex items-center">
                    <div className="rounded-lg bg-blue-50 p-2 mr-4">
                      <i className={`${getLeagueIcon(tournament.league)} text-2xl text-primary`}></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{tournament.name}</h3>
                      <p className="text-sm text-gray-500">{tournament.participants} partecipanti</p>
                    </div>
                    <div className="text-primary">
                      <i className="ri-arrow-right-s-line"></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </TabsContent>
      </Tabs>
      
      <BottomNavigation activeItem="sport" />
      
      {/* Pulsante per accedere alla schedina */}
      {user && (
        <div className="fixed bottom-20 right-4 z-30">
          <Button
            onClick={openSchedina}
            className="rounded-full w-14 h-14 bg-blue-700 hover:bg-blue-800 shadow-lg"
          >
            <ReceiptText className="h-6 w-6" />
            {bets.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                {bets.length}
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}