import { useState } from 'react';
import { Tournament } from '@/lib/types';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useLocation } from 'wouter';
import { ArrowRight, Trophy, Users, Calendar, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useUserTournaments } from '@/hooks/useTournamentStore';
import { useGetLegheQuery } from '../../store/api/legheApi';

export default function UserLeghePage() {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const { data: myTournaments, isLoading, refetch: refreshTournaments } = useGetLegheQuery();



  // Utilizza il nuovo hook che sfrutta lo store centralizzato
  //const { userTournaments: myTournaments, isLoading, refreshTournaments } = useUserTournaments();

  // Funzione per forzare l'aggiornamento dei dati
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshTournaments();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Filter tournaments based on status
  const getFilteredTournaments = () => {
    if (!myTournaments) return [];

    if (filter === 'all') {
      return myTournaments;
    } else if (filter === 'active') {
      return myTournaments.filter(t => new Date(t.dataFine) >= new Date());
    } else {
      return myTournaments.filter(t => new Date(t.dataFine) < new Date());
    }
  };

  const filteredTournaments = getFilteredTournaments();

  return (
    <div className="page-container bg-neutral-50">
      <Header
        showBackButton={true}
        title=""
        backDestination="/profile"
      />

      <div className="px-4 pt-4 pb-24">
        {/* Header con filtri e refresh */}
        <div className="flex items-center justify-between mb-4">
          {/* Filter tabs */}
          <div className="flex items-center justify-between flex-1 p-1 bg-white rounded-lg shadow-sm">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md flex-1 ${filter === 'all' ? 'bg-primary text-white' : 'text-gray-600'}`}
              onClick={() => setFilter('all')}
            >
              Tutti
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md flex-1 ${filter === 'active' ? 'bg-primary text-white' : 'text-gray-600'}`}
              onClick={() => setFilter('active')}
            >
              Attivi
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md flex-1 ${filter === 'completed' ? 'bg-primary text-white' : 'text-gray-600'}`}
              onClick={() => setFilter('completed')}
            >
              Conclusi
            </button>
          </div>

          {/* Refresh button */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 bg-white shadow-sm"
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
          >
            <RefreshCw className={`h-4 w-4 text-primary ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Tournament list */}
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-white rounded-lg shadow-sm">
                <Skeleton className="w-3/4 h-6 mb-2" />
                <Skeleton className="w-1/2 h-4 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="w-16 h-4" />
                  <Skeleton className="w-16 h-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTournaments.length > 0 ? (
          <div className="space-y-4">
            {filteredTournaments.map((tournament) => (
              <div
                key={tournament._id || tournament.id}
                className="p-4 bg-white rounded-lg shadow-sm"
                onClick={() => setLocation(`/sports/tournaments/${tournament._id || tournament.id}`)}
              >
                <h3 className="mb-1 font-semibold text-primary">{tournament.nome}</h3>
                <div className="mb-3 text-sm text-gray-500">{tournament.descrizione}</div>

                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-yellow-500" />
                    <span>{formatCurrency(tournament.prize || 0)} crediti</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-500" />
                    <span>{tournament.partecipanti.length || 0} partecipanti</span>
                  </div>
                </div>

                <div className="flex justify-between mt-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-green-500" />
                    <span>
                      {new Date(tournament.dataFine) < new Date()
                        ? `Terminato il ${formatDate(new Date(tournament.dataFine))}`
                        : `Termina il ${formatDate(new Date(tournament.dataFine))}`}
                    </span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            {filter === 'all'
              ? 'Non ci sono tornei attivi al momento.'
              : filter === 'active'
                ? 'Non ci sono tornei attivi al momento.'
                : 'Non hai ancora completato nessun torneo.'}
          </div>
        )}
      </div>

      <BottomNavigation activeItem="profile" />
    </div>
  );
}