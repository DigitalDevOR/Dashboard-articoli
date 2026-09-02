import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useGetLegaByIdQuery } from '@/store/api/legheApi';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useSchedineStore } from '@/store/useSchedineStore';
import type { Match } from '@/lib/types';
import { useIscrivitiLegaMutation } from '../../store/api/legheApi';
import { useEffect, useState, useMemo } from 'react';
import { useGetNotStartedMatchStateQuery } from '@/store/api/settingsApi';
import { useGetMatchsOfLeagueIdQuery } from '../../store/api/sportMonkApi';
import CampionatoMatches from '@/components/ui/CampionatoMatches';

interface Props {
  id: string;
}

export default function LegaDetailsPage({ id }: Props) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: torneo, isLoading: isTorneoLoading, isError, refetch } = useGetLegaByIdQuery(id);
  const [iscritto, setIscritto] = useState(false);
  const [iscrivitiTorneo, { isLoading: isIscrivitiLoading, isSuccess: isIscrivitiSuccess, isError: isIscrivitiError, error: IscrivitiError }] = useIscrivitiLegaMutation();
  const { data: notStartedMatchState, error: notStartedMatchStateError, isLoading: isNotStartedMatchStateLoading } = useGetNotStartedMatchStateQuery();
  const [selectedCampionatoId, setSelectedCampionatoId] = useState(() => {
    return localStorage.getItem('legaDetailsSelectedCampionatoId');
  });

  const handleJoin = async () => {
    if (!user) {
      setLocation(`/login?redirect=/sports/tournaments/${id}`);
      return;
    }

    try {
      await iscrivitiTorneo({ id }).unwrap();
      toast({
        title: 'Iscrizione completata',
        description: 'Sei iscritto al torneo!',
      });
      refetch();
    } catch (err: any) {
      toast({
        title: 'Errore durante l’iscrizione',
        description: err?.data?.message || 'Qualcosa è andato storto',
        variant: 'destructive',
      });
    }
  };

  // Leggi la tab attiva da localStorage all'avvio
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('legaDetailsActiveTab') || 'info';
  });

  // Salva la tab attiva su localStorage ogni volta che cambia
  useEffect(() => {
    localStorage.setItem('legaDetailsActiveTab', activeTab);
  }, [activeTab]);

  // Salva il filtro campionato selezionato ogni volta che cambia
  useEffect(() => {
    if (selectedCampionatoId) {
      localStorage.setItem('legaDetailsSelectedCampionatoId', selectedCampionatoId);
    }
  }, [selectedCampionatoId]);

  useEffect(() => {
    if (torneo) {
      setIscritto(torneo?.partecipanti?.some((p) => p._id === user?.id));
      // Se non c'è già un campionato selezionato, imposta il primo disponibile
      setSelectedCampionatoId(prev =>
        prev || torneo.campionati?.[0]?.id
      );
    }
    console.log('Torneo:', torneo);
  }, [torneo]);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Header title="" showBackButton backDestination="/sports" />

      <div className="flex-1 overflow-y-auto">
        {isTorneoLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : isError || !torneo ? (
          <div className="p-6 text-center">
            <p className="mb-2 text-gray-500">Torneo non trovato.</p>
            <Button onClick={() => setLocation('/sports')}>Torna indietro</Button>
          </div>
        ) : (
          <>
            {/* Header torneo */}
            <div className="p-4 text-white bg-primary">
              <h1 className="mb-1 text-xl font-semibold">{torneo.nome}</h1>
              <p className="mb-2 text-sm opacity-80">{torneo.descrizione}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <div className="opacity-70">Inizio</div>
                  <div>{formatDate(new Date(torneo.dataInizio))}</div>
                </div>
                <div>
                  <div className="opacity-70">Fine</div>
                  <div>{formatDate(new Date(torneo.dataFine))}</div>
                </div>
                <div>
                  <div className="opacity-70">Partecipanti</div>
                  <div>{torneo.partecipanti.length}</div>
                </div>
              </div>
            </div>

            {/* Banner partecipazione */}
            {!user ? (
              <div className="flex items-center justify-between p-4 text-sm bg-yellow-50">
                <span>Accedi per partecipare a questo torneo</span>
                <Button onClick={() => setLocation(`/login?redirect=/sports/tournaments/${id}`)}>
                  Accedi
                </Button>
              </div>
            ) : !iscritto ? (
              <div className="flex items-center justify-between p-4 text-sm bg-yellow-50">
                <span>Non sei ancora iscritto a questo torneo</span>
                <Button onClick={handleJoin} disabled={isIscrivitiLoading}>
                  {isIscrivitiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Iscrizione...
                    </>
                  ) : (
                    'Partecipa'
                  )}
                </Button>
              </div>
            ) : (
              <div className="p-4 text-sm text-green-600 bg-green-50">Sei iscritto a questo torneo</div>
            )}

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mt-2"
            >
              <TabsList className="grid w-full grid-cols-3 bg-white border-b">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="matches">Partite</TabsTrigger>
                <TabsTrigger value="leaderboard">Classifica</TabsTrigger>
              </TabsList>

              {/* Info tab */}
              <TabsContent value="info" className="p-4 space-y-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="mb-2 font-semibold">Regolamento</h3>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {torneo.regolamento?.map((r) => (
                      <li key={r._id}>{r.regola}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="mb-2 font-semibold">Premi</h3>
                  <ul className="space-y-2">
                    {torneo.premi?.map((p) => (
                      <li key={p._id} className="text-sm text-gray-700">
                        <span className="font-medium">{p.classificato}: </span>
                        {p.premio}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="mb-2 font-semibold">Campionati</h3>
                  <div className="flex flex-col">
                    {torneo.campionati?.map((c) => (
                      <div key={c._id} className='flex items-center gap-2 py-2'>
                        <img className='w-16 h-16' src={c.image_path} alt={c.name} />
                        <span className="font-medium">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Match tab */}
              <TabsContent value="matches" className="p-4">
                {torneo.campionati?.length === 0 ? (
                  <div className="py-4 text-sm text-center text-gray-500">
                    Nessun campionato associato.
                  </div>
                ) : (
                  <div className="flex gap-2 py-2 overflow-x-auto flex-nowrap">
                    {torneo.campionati.map(campionato => (
                      <div key={campionato.id} className="flex items-center flex-shrink-0 gap-2">
                        <img src={campionato.image_path} alt={campionato.name} className="w-6 h-6" />
                        <Button
                          variant={selectedCampionatoId === campionato.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCampionatoId(campionato.id)}
                          className="select-none"
                        >
                          {campionato.name}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {torneo.campionati
                  .filter(c => c.id === selectedCampionatoId)
                  .map(campionato => (
                    <CampionatoMatches
                      key={campionato.id}
                      campionato={campionato}
                      matchStateId={notStartedMatchState?.id}
                      legaId={id}
                      iscritto={iscritto} // <--- aggiungi questa riga
                    />
                  ))}
              </TabsContent>

              {/* Classifica tab */}
              <TabsContent value="leaderboard" className="p-4">
                {torneo.partecipanti.length > 0 ? (
                  <table className="w-full text-sm bg-white rounded shadow-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-2 text-left">Pos</th>
                        <th className="p-2 text-left">Utente</th>
                        <th className="p-2 text-right">Punti</th>
                      </tr>
                    </thead>
                    <tbody>
                      {torneo.partecipanti.map((p, index) => (
                        <tr key={p._id} className={p._id === user?._id ? 'bg-blue-50' : ''}>
                          <td className="p-2">{index + 1}</td>
                          <td className="flex items-center p-2">
                            <Avatar className="w-auto h-6">
                              <AvatarFallback>
                                {p.userName}
                              </AvatarFallback>
                            </Avatar>
                            {p.username}
                          </td>
                          <td className="p-2 text-right">{p.puntiTorneo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-center text-gray-500">Nessun partecipante ancora.</p>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      <BottomNavigation activeItem="sport" />
    </div>
  );
}
