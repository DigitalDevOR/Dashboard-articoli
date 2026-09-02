import { useState } from 'react';
import { useLocation } from 'wouter';
import { useGetLegaByIdQuery } from '@/store/api/legheApi';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

import { Loader2, Trophy, Users, Calendar, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';

interface Props {
  id: string;
}

export default function GuestLegaDetailsPage({ id }: Props) {
  const [, setLocation] = useLocation();
  const [showGuestDialog, setShowGuestDialog] = useState(false);

  const {
    data: tournament,
    isLoading,
    isError,
  } = useGetLegaByIdQuery(id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !tournament) {
    return (
      <div className="p-4 text-center">
        <p>Torneo non trovato</p>
        <Button variant="link" onClick={() => setLocation('/sports/tournaments')}>
          Torna ai tornei
        </Button>
      </div>
    );
  }

  return (
    <div className="page-container bg-neutral-50">
      <Header
        showLogo={false}
        showMenu={true}
        title={tournament.nome}
        leftElement={
          <Button variant="ghost" size="icon" onClick={() => setLocation('/sports/tournaments')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        }
      />

      <div className="p-4">
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{tournament.nome}</CardTitle>
                <CardDescription>{tournament.league || 'Torneo pubblico'}</CardDescription>
              </div>
              <div className="p-2 rounded-full bg-primary/10">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm">
                  {formatDate(tournament.dataInizio)} - {formatDate(tournament.dataFine)}
                </span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm">{tournament.partecipanti?.length || 0} partecipanti</span>
              </div>
            </div>

            <p className="mb-4 text-sm text-gray-600">
              {tournament.descrizione || 'Un torneo emozionante con grandi sfide e premi interessanti!'}
            </p>

            {tournament.premi?.length > 0 && (
              <div className="p-3 mb-4 border rounded-md bg-amber-50 border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-amber-800">Premi</h4>
                    <ul className="ml-4 text-xs list-disc text-amber-700">
                      {tournament.premi.map((premio: any) => (
                        <li key={premio._id}>
                          {premio.classificato}: {premio.premio}
                        </li>
                      ))}
                    </ul>
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

        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="leaderboard">Classifica</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Classifica Partecipanti</CardTitle>
                <CardDescription>
                  Registrati per vedere la classifica e partecipare
                </CardDescription>
              </CardHeader>
              <CardContent className="py-6 text-center">
                <div className="inline-flex p-4 mb-4 rounded-full bg-primary/10">
                  <Trophy className="w-10 h-10 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-medium">Partecipa al torneo</h3>
                <p className="mb-4 text-sm text-gray-600">
                  Registrati per visualizzare la classifica e confrontarti con altri appassionati
                </p>
                <Button onClick={() => setShowGuestDialog(true)}>Registrati ora</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

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
