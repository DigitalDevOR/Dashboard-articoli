// src/components/tournaments/TorneoCard.tsx
import { Tournament } from '@/lib/types';
import { getLeagueIcon } from '@/lib/utils';
import { useEffect } from 'react';
import { useLocation } from 'wouter';

type Props = {
  tournament: Tournament;
};

//associare i giusti valori del torneo

export default function LegaCard({ tournament }: Props) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    console.log('TorneoCard mounted with tournament:', tournament);
  }, [tournament]);

  return (
    <div
      className="p-4 bg-white rounded-lg shadow-sm cursor-pointer"
      onClick={() => setLocation(`/sports/tournaments/${tournament._id || tournament.id}`)}
    >
      <div className="flex items-center">
        <div className="p-2 mr-4 rounded-lg bg-blue-50">
          {/*<i className={`${getLeagueIcon(tournament.league)} text-2xl text-primary`}></i>*/}
          <i className="text-2xl text-primary"></i>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{tournament.nome}</h3>
          <p className="text-sm text-gray-500">
            {tournament.partecipanti?.length || 0} partecipanti
          </p>
        </div>
        <div className="text-primary">
          <i className="ri-arrow-right-s-line"></i>
        </div>
      </div>
    </div>
  );
}
