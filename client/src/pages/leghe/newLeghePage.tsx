import { useGetLegheQuery } from '@/store/api/legheApi';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LegheList from './LegheList';
import EmptyState from './EmptyState';
import PlayerSchedine from '../playerSchedine';

export default function LeghePage() {
  const { data: tournaments, isLoading, error } = useGetLegheQuery();

  //controllare tournaments
  //controllare formattazione tournaments
  //controllare tornei list
  //controllare passaggio di prop a tornei list


  return (
    <>
      <Header title="" showMenu={true} />
      <div className="p-4 select-none bg-neutral-50 page-content">
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="sticky top-0 z-10 flex flex-row gap-2 bg-transparent">
            <TabsTrigger value="available" className="py-3 font-medium">
              Tornei Disponibili
            </TabsTrigger>
            <TabsTrigger value="your-bets" className="py-3 font-medium ">
              Le tue schedine
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="p-4">
            <h2 className="mb-4 text-lg font-semibold text-primary">Tornei BetMasterLeague</h2>

            {isLoading ? (
              <EmptyState message="Caricamento tornei..." />
            ) : error ? (
              <EmptyState message="Errore nel caricamento dei tornei." />
            ) : tournaments && tournaments.length > 0 ? (
              <LegheList tournaments={tournaments} />
            ) : (
              <EmptyState message="Nessun torneo disponibile." />
            )}
          </TabsContent>
          <TabsContent value="your-bets" className="p-4">
            <PlayerSchedine />
          </TabsContent>
        </Tabs>
      </div>
      <BottomNavigation activeItem="sport" />
    </>
  );
}
