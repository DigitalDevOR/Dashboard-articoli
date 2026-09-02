import { FC } from 'react';
import { useLocation } from 'wouter';
import { Tournament } from '@/lib/types';
import { getRelativeTimeString } from '@/lib/utils';

interface TournamentCardProps {
  tournament: Tournament;
  type?: 'regular' | 'special';
}

const TournamentCard: FC<TournamentCardProps> = ({ tournament, type = 'regular' }) => {
  const [, setLocation] = useLocation();
  
  const handleClick = () => {
    setLocation(`/sports/tournaments/${tournament.id}`);
  };
  
  if (type === 'special') {
    return (
      <div className="tournament-card">
        <div className="flex justify-between">
          <div>
            <h3 className="font-semibold text-primary text-md">{tournament.name}</h3>
            <p className="text-xs text-gray-500">
              Scade tra {getRelativeTimeString(new Date(tournament.endDate))}
            </p>
            <div className="mt-2 flex items-center">
              <span className="text-xs text-gray-600 mr-4">
                Partecipanti: {tournament.participants}
              </span>
              <span className="text-xs text-gray-600">
                Premio: {tournament.prize} pts
              </span>
            </div>
          </div>
          <button 
            className="bg-primary text-white text-sm font-semibold py-1 px-3 rounded"
            onClick={handleClick}
          >
            Partecipa
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="p-4 flex items-center justify-between cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center">
        <i className="ri-football-line text-lg text-primary mr-3"></i>
        <span className="font-medium">{tournament.name}</span>
      </div>
      <i className="ri-arrow-right-s-line text-gray-400"></i>
    </div>
  );
};

export default TournamentCard;
