import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trophy, Users, Calendar, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';

interface GuestTournamentDetailsPageProps {
  id: string;
}

export default function GuestTournamentDetailsPage({ id }: GuestTournamentDetailsPageProps) {
  const [, setLocation] = useLocation();
  const [showGuestDialog, setShowGuestDialog] = useState(false);
  
  // Tournament data
  const { data: tournament, isLoading } = useQuery<any>({
    queryKey: [`/api/tournaments/${id}`],
  });
  
  // Tournament matches
  const { data: matches = [], isLoading: isLoadingMatches } = useQuery<any[]>({
    queryKey: [`/api/tournaments/${id}/matches`],
    enabled: !!tournament,
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="p-4 text-center">
        <p>Torneo non trovato</p>
        <Button variant="link" onClick={() => setLocation('/sports/tournaments')}>Torna ai tornei</Button>
      </div>
    );
  }

  return (
    <div className="page-container bg-neutral-50">
      <Header 
        showLogo={false}
        showMenu={true}
        title={tournament.name} 
        leftElement={
          <Button variant="ghost" size="icon" onClick={() => setLocation('/sports/tournaments')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        }
      />
      
      <div className="p-4">
        {/* Tournament Info */}
        <Card className="mb-4">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{tournament.name}</CardTitle>
                <CardDescription>{tournament.league}</CardDescription>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">
                  {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                </span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">{tournament.participants} partecipanti</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {tournament.description || 'Un torneo emozionante con grandi sfide e premi interessanti!'}
            </p>
            
            {tournament.isPaid && (
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-amber-800">Torneo Premium</h4>
                    <p className="text-xs text-amber-700">Quota di iscrizione: {tournament.entryFee} crediti</p>
                  </div>
                  <div className="bg-amber-100 px-2 py-1 rounded">
                    <span className="text-amber-800 font-bold">{tournament.prize} crediti</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => setShowGuestDialog(true)} className="w-full">
              Partecipa al torneo
            </Button>
          </CardFooter>
        </Card>
        
        {/* Matches and Leaderboard Tabs */}
        <Tabs defaultValue="matches" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="matches">Partite</TabsTrigger>
            <TabsTrigger value="leaderboard">Classifica</TabsTrigger>
          </TabsList>
          
          <TabsContent value="matches" className="space-y-4 mt-4">
            {isLoadingMatches ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : matches.length > 0 ? (
              matches.map((match: any) => (
                <Card key={match._id} className="match-card">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">{match.league}</span>
                      <span className="text-xs font-semibold text-gray-700">
                        {new Date(match.startTime).toLocaleString('it-IT', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{match.homeTeam}</span>
                        <div className="flex space-x-2">
                          <span className="odds-button inactive">{match.homeOdds}</span>
                          <span className="odds-button inactive">{match.drawOdds}</span>
                          <span className="odds-button inactive">{match.awayOdds}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{match.awayTeam}</span>
                        <div>
                          <Button variant="link" size="sm" className="text-xs p-0 h-auto" onClick={() => setShowGuestDialog(true)}>
                            Pronostica
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nessuna partita disponibile per questo torneo
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="leaderboard" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Classifica Partecipanti</CardTitle>
                <CardDescription>
                  Registrati per vedere la classifica e partecipare
                </CardDescription>
              </CardHeader>
              <CardContent className="py-6 text-center">
                <div className="rounded-full bg-primary/10 p-4 inline-flex mb-4">
                  <Trophy className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Partecipa al torneo</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Registrati per visualizzare la classifica e confrontarti con altri appassionati
                </p>
                <Button onClick={() => setShowGuestDialog(true)}>
                  Registrati ora
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Guest Dialog */}
      <Dialog open={showGuestDialog} onOpenChange={setShowGuestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Accesso richiesto</DialogTitle>
            <DialogDescription>
              Per partecipare ai tornei devi registrarti. Vuoi creare un account ora?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setShowGuestDialog(false)}>
              Annulla
            </Button>
            <Button onClick={() => setLocation('/register')}>
              Registrati
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <BottomNavigation activeItem="sport" />
    </div>
  );
}