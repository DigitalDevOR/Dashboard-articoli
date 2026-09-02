import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useLocation } from 'wouter';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { SchedinaSidebar } from '@/components/betting/SchedinaSidebar';
import { BonusBookmakers } from '@/components/betting/BonusBookmakers';
import { BookmakerComparison } from '@/components/betting/BookmakerComparison';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Footer from '@/components/layout/Footer';
import { Match } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

interface MatchDetailsPageProps {
  id?: string;
}

export default function MatchDetailsPage({ id: propId }: MatchDetailsPageProps) {
  const params = useParams<{ id: string }>();
  const matchId = propId || params.id;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  
  // Ottieni i dati della partita
  const { data: match, isLoading: isMatchLoading } = useQuery<Match>({
    queryKey: [`/api/matches/${matchId}`],
  });
  
  // Verifica se l'utente è iscritto al torneo
  const { data: isTournamentParticipant, isLoading: isParticipantLoading } = useQuery<boolean>({
    queryKey: [`/api/tournaments/${match?.tournamentId}/participants/me`],
    enabled: !!match?.tournamentId && !!user,
  });
  
  const loading = isMatchLoading || isParticipantLoading;
  
  const handleBack = () => {
    setLocation('/sports');
  };
  
  const handleOddsClick = (type: string) => {
    if (!user) {
      // Utente non loggato: mostra modale per registrarsi
      setShowLoginModal(true);
      return;
    }
    
    if (match?.tournamentId && !isTournamentParticipant) {
      // Utente loggato ma non iscritto al torneo: mostra modale per iscriversi
      setShowTournamentModal(true);
      return;
    }
    
    // Utente loggato e iscritto: aggiungi alla schedina
    const bet = {
      matchId: match?._id || match?.id,
      homeTeam: match?.homeTeam,
      awayTeam: match?.awayTeam,
      startTime: match?.startTime,
      status: match?.status,
      odds: type === 'home' ? match?.homeOdds || 1 : 
            type === 'draw' ? match?.drawOdds || 1 : 
            match?.awayOdds || 1,
      outcome: type === 'home' ? '1' : type === 'draw' ? 'X' : '2',
      bookmaker: 'Bet Master'
    };
    
    // Aggiungi alla schedina
    window.dispatchEvent(new CustomEvent('add-bet', { detail: bet }));
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showBackButton={true} title="Dettaglio Partita" backDestination="/sports" />
        <main className="flex-1 p-4 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!match) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showBackButton={true} title="Dettaglio Partita" backDestination="/sports" />
        <main className="flex-1 p-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">Partita non trovata</p>
              <Button variant="link" onClick={handleBack} className="mt-2">
                Torna alle partite
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Formatta la data e l'ora della partita
  const matchDate = new Date(match.startTime);
  const formattedDate = format(matchDate, 'd MMMM yyyy', { locale: it });
  const formattedTime = format(matchDate, 'HH:mm');
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 p-4 max-w-6xl mx-auto">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft size={16} className="mr-2" />
          Torna alle quote
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Card className="mb-4">
              <div className="bg-blue-800 text-white p-4">
                <h1 className="text-xl font-bold">{match.homeTeam} - {match.awayTeam}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm">{match.league}</span>
                  <span className="text-sm">•</span>
                  <span className="text-sm">{formattedDate} ore {formattedTime}</span>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center flex-1">
                    <div className="text-lg font-bold">{match.homeTeam}</div>
                    {match.status === 'live' && match.result && (
                      <div className="text-2xl font-bold mt-2">{match.result.split('-')[0].trim()}</div>
                    )}
                  </div>
                  
                  <div className="text-center px-4">
                    {match.status === 'live' && (
                      <div className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded mb-2">
                        LIVE
                      </div>
                    )}
                    <div className="text-gray-500">VS</div>
                  </div>
                  
                  <div className="text-center flex-1">
                    <div className="text-lg font-bold">{match.awayTeam}</div>
                    {match.status === 'live' && match.result && (
                      <div className="text-2xl font-bold mt-2">{match.result.split('-')[1].trim()}</div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <Button 
                    variant="outline"
                    className="p-3 h-auto flex flex-col"
                    onClick={() => {
                      // Aggiungi pronostico per vittoria casa
                      const bet = {
                        matchId: match._id.toString(),
                        homeTeam: match.homeTeam,
                        awayTeam: match.awayTeam,
                        startTime: match.startTime,
                        status: match.status,
                        odds: match.homeOdds || 1,
                        outcome: '1', // vittoria casa
                        bookmaker: 'Bet Master'
                      };
                      
                      // Invia evento per aggiungere alla schedina
                      window.dispatchEvent(new CustomEvent('add-bet', { detail: bet }));
                    }}
                  >
                    <span className="text-sm">1</span>
                    <span className="text-lg font-bold">{match.homeOdds?.toFixed(2)}</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="p-3 h-auto flex flex-col"
                    onClick={() => {
                      // Aggiungi pronostico per pareggio
                      const bet = {
                        matchId: match._id.toString(),
                        homeTeam: match.homeTeam,
                        awayTeam: match.awayTeam,
                        startTime: match.startTime,
                        status: match.status,
                        odds: match.drawOdds || 1,
                        outcome: 'X', // pareggio
                        bookmaker: 'Bet Master'
                      };
                      
                      // Invia evento per aggiungere alla schedina
                      window.dispatchEvent(new CustomEvent('add-bet', { detail: bet }));
                    }}
                  >
                    <span className="text-sm">X</span>
                    <span className="text-lg font-bold">{match.drawOdds?.toFixed(2)}</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="p-3 h-auto flex flex-col"
                    onClick={() => {
                      // Aggiungi pronostico per vittoria trasferta
                      const bet = {
                        matchId: match._id.toString(),
                        homeTeam: match.homeTeam,
                        awayTeam: match.awayTeam,
                        startTime: match.startTime,
                        status: match.status,
                        odds: match.awayOdds || 1,
                        outcome: '2', // vittoria trasferta
                        bookmaker: 'Bet Master'
                      };
                      
                      // Invia evento per aggiungere alla schedina
                      window.dispatchEvent(new CustomEvent('add-bet', { detail: bet }));
                    }}
                  >
                    <span className="text-sm">2</span>
                    <span className="text-lg font-bold">{match.awayOdds?.toFixed(2)}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <BookmakerComparison match={match} />
            
            <div className="mt-6">
              <BonusBookmakers />
            </div>
          </div>
          
          <div>
            <SchedinaSidebar />
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Modal per utenti non loggati */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accedi per fare pronostici</DialogTitle>
            <DialogDescription>
              Per fare pronostici su questa partita devi avere un account. Registrati o accedi per iniziare.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-6">
            <Button variant="outline" onClick={() => setShowLoginModal(false)}>
              Annulla
            </Button>
            <Button onClick={() => setLocation("/login")}>
              Accedi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal per utenti non iscritti al torneo */}
      <Dialog open={showTournamentModal} onOpenChange={setShowTournamentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iscriviti al torneo</DialogTitle>
            <DialogDescription>
              Per fare pronostici su questa partita devi essere iscritto al torneo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-6">
            <Button variant="outline" onClick={() => setShowTournamentModal(false)}>
              Annulla
            </Button>
            <Button onClick={() => {
              if (match?.tournamentId) {
                setLocation(`/tournaments/${match.tournamentId}`);
              }
              setShowTournamentModal(false);
            }}>
              Iscriviti al torneo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}