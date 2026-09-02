import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Tournament, Match, User } from '@/lib/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTournamentParticipation } from '@/hooks/useTournamentParticipation';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import MatchCard from '@/components/common/MatchCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, ReceiptText } from 'lucide-react';
import { useSchedineStore } from '@/store/useSchedineStore';

interface Participant {
  user: User;
  points: number;
  position: number;
  joinedAt: string;
}

interface TournamentDetailsPageProps {
  id?: string;
}

export default function TournamentDetailsPage({ id: propId }: TournamentDetailsPageProps = {}) {
  const params = useParams<{ id: string }>();
  const id = propId || params.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const { openSchedina, bets } = useSchedineStore();
  
  // Fetch tournament details from Express backend
  const { data: tournament, isLoading: tournamentLoading } = useQuery<Tournament>({
    queryKey: [`/api/tournaments/${id}`],
  });
  
  // Fetch tournament matches from Sportmonks API via Express backend
  const { data: matches, isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: [`/api/sportsmonk/fixtures/tournament/${id}`],
    enabled: !!tournament,
  });
  
  // Fetch tournament participants (leaderboard)
  const { data: participants, isLoading: participantsLoading } = useQuery<Participant[]>({
    queryKey: [`/api/tournaments/${id}/participants`],
    enabled: !!tournament,
  });
  
  // Utilizziamo il nuovo hook per gestire la partecipazione
  const { 
    isParticipating, 
    toggleParticipation, 
    isProcessing 
  } = useTournamentParticipation(id);
  
  const handleJoinTournament = async () => {
    // L'utente deve essere autenticato per iscriversi
    if (!user) {
      // Redirect alla pagina di login con ritorno all'URL del torneo
      setLocation(`/login?redirect=/tournaments/${id}`);
      return;
    }
    
    // Verifica che l'utente abbia abbastanza crediti per tornei a pagamento
    if (tournament?.isPaid && (user.credits < (tournament.entryFee || 0))) {
      toast({
        title: 'Crediti insufficienti',
        description: `Hai bisogno di ${tournament.entryFee} crediti per partecipare a questo torneo`,
        variant: 'destructive',
      });
      return;
    }
    
    // Usa la funzione del hook per gestire la partecipazione
    await toggleParticipation();
  };
  
  const isLoading = tournamentLoading;
  const isJoining = isProcessing;
  
  return (
    <div className="page-container bg-neutral-50">
      <Header 
        showBackButton={true} 
        title="Dettaglio Torneo"
        backDestination="/sports/tournaments"
      />
      
      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tournament ? (
        <div className="flex flex-col flex-grow">
          {/* Tournament Info Header */}
          <div className="bg-primary text-white p-4">
            <h1 className="text-xl font-semibold mb-1">{tournament.name}</h1>
            <p className="text-sm opacity-80 mb-3">{tournament.league}</p>
            
            <div className="flex justify-between items-center text-sm">
              <div>
                <div className="opacity-70">Inizio</div>
                <div>{formatDate(new Date(tournament.startDate))}</div>
              </div>
              <div>
                <div className="opacity-70">Fine</div>
                <div>{formatDate(new Date(tournament.endDate))}</div>
              </div>
              <div>
                <div className="opacity-70">Partecipanti</div>
                <div>{tournament.participants}</div>
              </div>
              {tournament.isPaid && (
                <div>
                  <div className="opacity-70">Premio</div>
                  <div>{tournament.prize} pts</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Join Banner (only show if not participating and user is logged in) */}
          {user && !isParticipating && (
            <div className="bg-yellow-50 p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-primary">
                  {tournament.isPaid ? `Quota: ${tournament.entryFee} crediti` : 'Partecipazione gratuita'}
                </p>
                <p className="text-xs text-gray-500">
                  {tournament.status === 'upcoming' ? 'In attesa di iniziare' : 
                   tournament.status === 'active' ? 'Torneo in corso' : 
                   'Torneo terminato'}
                </p>
              </div>
              <Button 
                className="btn-primary"
                disabled={tournament.status === 'completed' || isJoining}
                onClick={handleJoinTournament}
              >
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iscrizione...
                  </>
                ) : (
                  'Partecipa'
                )}
              </Button>
            </div>
          )}
          
          {/* Login banner for not authenticated users */}
          {!user && (
            <div className="bg-yellow-50 p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-primary">
                  {tournament.isPaid ? `Quota: ${tournament.entryFee} crediti` : 'Partecipazione gratuita'}
                </p>
                <p className="text-xs text-gray-500">
                  Accedi per partecipare a questo torneo
                </p>
              </div>
              <Button 
                className="btn-primary"
                onClick={() => setLocation("/login?redirect=/sports/tournaments/" + id)}
              >
                Accedi
              </Button>
            </div>
          )}
          
          {/* Banner for users who are already participating */}
          {user && isParticipating && (
            <div className="bg-green-50 p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-green-600">
                  Sei iscritto a questo torneo
                </p>
                <p className="text-xs text-gray-500">
                  {tournament?.status === 'upcoming' ? 'Il torneo inizierà presto' : 
                   tournament?.status === 'active' ? 'Torneo attivo, fai i tuoi pronostici' : 
                   'Il torneo è terminato'}
                </p>
              </div>
              <Button 
                variant="outline"
                className="border-red-200 text-red-500 hover:bg-red-50"
                onClick={toggleParticipation}
                disabled={isProcessing || tournament?.status === 'completed'}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Abbandono...
                  </>
                ) : (
                  'Abbandona'
                )}
              </Button>
            </div>
          )}
          
          {/* Tabs Navigation */}
          <Tabs defaultValue="info" className="flex-1" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full rounded-none border-b bg-white h-auto">
              <TabsTrigger value="info" className="py-3 data-[state=active]:bg-neutral-50">
                Info
              </TabsTrigger>
              <TabsTrigger value="matches" className="py-3 data-[state=active]:bg-neutral-50">
                Partite
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="py-3 data-[state=active]:bg-neutral-50">
                Classifica
              </TabsTrigger>
            </TabsList>
            
            {/* Info Tab */}
            <TabsContent value="info" className="p-4">
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h3 className="font-semibold mb-2">Descrizione</h3>
                <p className="text-sm text-gray-600">
                  {tournament.description || 'Nessuna descrizione disponibile per questo torneo.'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h3 className="font-semibold mb-2">Regolamento</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                  <li>Ogni pronostico corretto vale 3 punti</li>
                  <li>Ogni risultato esatto vale 5 punti</li>
                  <li>Pronostici accettati fino a 5 minuti prima dell'inizio della partita</li>
                  <li>La classifica viene aggiornata al termine di ogni giornata</li>
                  <li>Il vincitore sarà determinato dal punteggio totale alla fine del torneo</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold mb-2">Premi</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-yellow-100 rounded-full mr-3">
                      <i className="ri-trophy-line text-yellow-500"></i>
                    </div>
                    <div>
                      <div className="font-medium">1° Classificato</div>
                      <div className="text-sm text-gray-500">{tournament.prize || 1000} punti</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full mr-3">
                      <i className="ri-medal-line text-gray-500"></i>
                    </div>
                    <div>
                      <div className="font-medium">2° Classificato</div>
                      <div className="text-sm text-gray-500">{Math.floor((tournament.prize || 1000) * 0.5)} punti</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-amber-100 rounded-full mr-3">
                      <i className="ri-medal-2-line text-amber-700"></i>
                    </div>
                    <div>
                      <div className="font-medium">3° Classificato</div>
                      <div className="text-sm text-gray-500">{Math.floor((tournament.prize || 1000) * 0.25)} punti</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Matches Tab */}
            <TabsContent value="matches" className="p-4">
              {matchesLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white h-24 rounded-lg"></div>
                  ))}
                </div>
              ) : matches && matches.length > 0 ? (
                <div className="space-y-3">
                  {matches.map((match) => (
                    <div 
                      key={match.id} 
                      className="bg-white rounded-lg shadow-sm overflow-hidden"
                    >
                      <MatchCard 
                        match={match} 
                        onSelectOdds={async (type) => {
                          // Debug info
                          console.log("DEBUG PRONOSTICO - Utente:", user?.username);
                          console.log("DEBUG PRONOSTICO - Partecipante?", isParticipating);
                          
                          // Utente non autenticato
                          if (!user) {
                            toast({
                              title: 'Accesso richiesto',
                              description: 'Devi accedere per fare pronostici',
                              variant: 'destructive',
                            });
                            return;
                          }
                          
                          // Verifichiamo sempre prima di procedere
                          // Se l'utente non è iscritto, mostriamo un messaggio
                          if (!isParticipating) {
                            toast({
                              title: 'Iscrizione richiesta',
                              description: 'Devi iscriverti al torneo per fare pronostici',
                              variant: 'destructive',
                            });
                            return;
                          }
                          
                          // Utente autenticato e iscritto - aggiungi il pronostico alla schedina
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
                          
                          console.log("Pronostico creato correttamente:", bet);
                          
                          // Usa l'EventBus per aggiungere la scommessa
                          try {
                            window.dispatchEvent(new CustomEvent('add-bet', { detail: bet }));
                            console.log("Evento aggiunta scommessa inviato");
                            
                            // Aggiungiamo anche una notifica per l'utente
                            toast({
                              title: 'Pronostico aggiunto',
                              description: `${bet.homeTeam} vs ${bet.awayTeam}: ${bet.outcome}`
                            });
                          } catch(e) {
                            console.error("Errore nell'aggiunta del pronostico:", e);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm">
                  <i className="ri-football-line text-3xl text-gray-300 mb-2"></i>
                  <p>Nessuna partita disponibile</p>
                  <p className="text-sm mt-1">Le partite del torneo saranno aggiunte prossimamente</p>
                </div>
              )}
            </TabsContent>
            
            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="p-4">
              {participantsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white h-16 rounded-lg"></div>
                  ))}
                </div>
              ) : participants && participants.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pos
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utente
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Punti
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {participants.map((participant) => (
                        <tr key={participant.user.id} className={participant.user.id === user?.id ? 'bg-blue-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {participant.position}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {participant.user.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-sm font-medium text-gray-900">
                                {participant.user.username}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <span className="font-bold">{participant.points}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm">
                  <i className="ri-trophy-line text-3xl text-gray-300 mb-2"></i>
                  <p>Nessun partecipante</p>
                  <p className="text-sm mt-1">Sii il primo a partecipare a questo torneo!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center p-4">
            <p className="text-gray-500">Torneo non trovato</p>
            <Button
              className="mt-4"
              onClick={() => setLocation('/sports')}
            >
              Torna ai Tornei
            </Button>
          </div>
        </div>
      )}
      
      <BottomNavigation activeItem="sport" />
      
      {/* Utilizziamo il pulsante globale della schedina */}
    </div>
  );
}