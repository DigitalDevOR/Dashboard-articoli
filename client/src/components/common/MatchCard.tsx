import { FC } from 'react';
import { Match } from '@/lib/types';
import { formatTime, getLeagueIcon } from '@/lib/utils';

interface MatchCardProps {
  match: Match;
  onCompare?: (matchId: string) => void;
  selectedOdds?: 'home' | 'draw' | 'away' | null;
  onSelectOdds?: (type: 'home' | 'draw' | 'away') => void;
}

const MatchCard: FC<MatchCardProps> = ({ 
  match, 
  onCompare, 
  selectedOdds = null,
  onSelectOdds 
}) => {
  return (
    <div className="match-card">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-500">{match.league}</span>
        <span className="text-xs font-semibold text-gray-700">
          {formatTime(new Date(match.startTime))}
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <i className={`${getLeagueIcon(match.league)} mr-2 text-primary`}></i>
          <span className="text-sm font-medium">{match.homeTeam}</span>
        </div>
        {/* Mostra sempre i bottoni delle quote, anche se sono vuoti (per coerenza UI) */}
        <div className="flex space-x-2">
          <button 
            className={`odds-button ${selectedOdds === 'home' ? 'active' : 'inactive'}`}
            onClick={() => onSelectOdds && onSelectOdds('home')}
            disabled={!match.homeOdds}
          >
            {match.homeOdds ? match.homeOdds.toFixed(2) : '1'}
          </button>
          <button 
            className={`odds-button ${selectedOdds === 'draw' ? 'active' : 'inactive'}`}
            onClick={() => onSelectOdds && onSelectOdds('draw')}
            disabled={!match.drawOdds}
          >
            {match.drawOdds ? match.drawOdds.toFixed(2) : 'X'}
          </button>
          <button 
            className={`odds-button ${selectedOdds === 'away' ? 'active' : 'inactive'}`}
            onClick={() => onSelectOdds && onSelectOdds('away')}
            disabled={!match.awayOdds}
          >
            {match.awayOdds ? match.awayOdds.toFixed(2) : '2'}
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center">
          <i className={`${getLeagueIcon(match.league)} mr-2 text-primary opacity-50`}></i>
          <span className="text-sm font-medium">{match.awayTeam}</span>
        </div>
        {/* Rimuoviamo il pulsante Compare che causava errori */}
      </div>
    </div>
  );
};

export default MatchCard;
