import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Calendar, Trophy, TrendingUp } from 'lucide-react';

export default function GuestSportsPage() {
  const [, setLocation] = useLocation();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<'tournament' | 'prediction'>('tournament');
  
  // Fetch tournaments
  const { data: tournaments = [], isLoading: isLoadingTournaments } = useQuery<any[]>({
    queryKey: ['/api/tournaments'],
  });
  
  // Fetch paid tournaments
  const { data: paidTournaments = [], isLoading: isLoadingPaidTournaments } = useQuery<any[]>({
    queryKey: ['/api/tournaments/paid'],
  });
  
  // Fetch upcoming matches
  const { data: upcomingMatches = [], isLoading: isLoadingMatches } = useQuery<any[]>({
    queryKey: ['/api/matches/upcoming'],
  });
  
  const handleTournamentClick = (id: string) => {
    setLocation(`/tournaments/${id}`);
  };
  
  const handlePredictionClick = () => {
    setDialogAction('prediction');
    setShowAuthDialog(true);
  };
  
  const handleJoinTournamentClick = () => {
    setDialogAction('tournament');
    setShowAuthDialog(true);
  };
  
  const handleRegisterClick = () => {
    setShowAuthDialog(false);
    setLocation('/auth/register');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="page-container">
      <Header 
        title="Sport" 
        showMenu={true}
        showNotification={true}
      />
      
      <div className="p-4">
        <Tabs defaultValue="tournaments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tournaments">Tornei</TabsTrigger>
            <TabsTrigger value="my-tournaments">I Miei Tornei</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tournaments" className="space-y-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium">Tornei in evidenza</h2>
              <Button 
                variant="link" 
                size="sm" 
                className="text-primary font-medium"
                onClick={() => setLocation('/tournaments')}
              >
                Vedi tutti
              </Button>
            </div>
            
            {isLoadingTournaments ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Caricamento tornei...</p>
              </div>
            ) : tournaments.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {tournaments.map((tournament: any) => (
                  <Card key={tournament._id} className="overflow-hidden">
                    <div className="bg-primary/10 p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Trophy className="h-5 w-5 text-primary mr-2" />
                          <h3 className="font-medium">{tournament.name}</h3>
                        </div>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">{tournament.status}</span>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center text-sm mb-3">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</span>
                        </div>
                        <span className="font-medium">{tournament.participants} partecipanti</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {tournament.description || `Torneo di ${tournament.league} con partite selezionate.`}
                      </p>
                      
                      {tournament.isPaid && (
                        <div className="bg-amber-50 border border-amber-200 rounded p-2 flex justify-between items-center mb-3">
                          <span className="text-amber-800 text-xs">Quota: {tournament.entryFee} crediti</span>
                          <span className="bg-amber-100 text-amber-800 font-bold text-xs px-2 py-1 rounded">
                            Premio: {tournament.prize} crediti
                          </span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-3 pt-0">
                      <div className="flex justify-between w-full">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleTournamentClick(tournament._id)}
                        >
                          Dettagli
                        </Button>
                        <Button 
                          size="sm"
                          onClick={handleJoinTournamentClick}
                        >
                          Partecipa
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nessun torneo disponibile al momento
              </div>
            )}
            
            <Separator className="my-6" />
            
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium">Tornei premium</h2>
            </div>
            
            {isLoadingPaidTournaments ? (
              <div className="py-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : paidTournaments.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {paidTournaments.map((tournament: any) => (
                  <Card key={tournament._id} className="premium-tournament overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-400 to-amber-300 p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Trophy className="h-5 w-5 text-amber-900 mr-2" />
                          <h3 className="font-medium text-amber-900">{tournament.name}</h3>
                        </div>
                        <span className="text-xs bg-amber-100/80 text-amber-900 px-2 py-1 rounded-full">Premium</span>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center text-sm mb-3">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-amber-600 mr-1" />
                          <span className="font-medium text-amber-600">{tournament.participants} partecipanti</span>
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-200 rounded p-2 flex justify-between items-center mb-3">
                        <span className="text-amber-800 text-xs">Quota: {tournament.entryFee} crediti</span>
                        <span className="bg-amber-200 text-amber-900 font-bold text-xs px-2 py-1 rounded">
                          Premio: {tournament.prize} crediti
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-3 pt-0">
                      <div className="flex justify-between w-full">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleTournamentClick(tournament._id)}
                        >
                          Dettagli
                        </Button>
                        <Button 
                          size="sm"
                          onClick={handleJoinTournamentClick}
                          className="bg-amber-500 hover:bg-amber-600"
                        >
                          Partecipa
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                Nessun torneo premium disponibile al momento
              </div>
            )}
            
            <Separator className="my-6" />
            
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium">Partite in evidenza</h2>
              <Button 
                variant="link" 
                size="sm" 
                className="text-primary font-medium"
                onClick={() => setLocation('/matches')}
              >
                Vedi tutte
              </Button>
            </div>
            
            {isLoadingMatches ? (
              <div className="py-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : upcomingMatches.length > 0 ? (
              <div className="space-y-3">
                {upcomingMatches.slice(0, 3).map((match: any) => (
                  <Card key={match._id} className="overflow-hidden">
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
                            <button 
                              className="odds-button"
                              onClick={handlePredictionClick}
                            >
                              {match.homeOdds}
                            </button>
                            <button 
                              className="odds-button"
                              onClick={handlePredictionClick}
                            >
                              {match.drawOdds}
                            </button>
                            <button 
                              className="odds-button"
                              onClick={handlePredictionClick}
                            >
                              {match.awayOdds}
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{match.awayTeam}</span>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="text-xs p-0 h-auto"
                            onClick={handlePredictionClick}
                          >
                            Pronostica
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                Nessuna partita in programma
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-tournaments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">I Miei Tornei</CardTitle>
              </CardHeader>
              <CardContent className="py-6 text-center">
                <div className="rounded-full bg-primary/10 p-4 inline-flex mb-4">
                  <Trophy className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nessun torneo attivo</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Registrati per partecipare ai tornei e iniziare a fare pronostici
                </p>
                <Button onClick={handleRegisterClick}>
                  Registrati ora
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Accesso richiesto</DialogTitle>
            <DialogDescription>
              {dialogAction === 'tournament' 
                ? "Per partecipare ai tornei devi registrarti. Vuoi creare un account ora?" 
                : "Per fare un pronostico devi registrarti. Vuoi creare un account ora?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setShowAuthDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleRegisterClick}>
              Registrati
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <BottomNavigation activeItem="sport" />
    </div>
  );
}