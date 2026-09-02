import React from 'react';
import { MockMatch } from '@/mock/mockMatches';
import { getBestOddsForMatch } from '@/mock/mockOdds';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { format, isSameDay, addHours } from 'date-fns';
import { it } from 'date-fns/locale';
import { useSchedineStore } from '@/store/useSchedineStore';

interface MatchOddsRowProps {
  match: MockMatch;
}

export function MatchOddsRow({ match }: MatchOddsRowProps) {
  const [, setLocation] = useLocation();
  const { addBet, removeBet, bets } = useSchedineStore();
  
  // Formatta la data della partita in formato italiano
  const matchDate = new Date(match.startTime);
  const today = new Date();
  
  let dateDisplay = '';
  
  if (isSameDay(matchDate, today)) {
    dateDisplay = 'Oggi';
  } else if (isSameDay(matchDate, addHours(today, 24))) {
    dateDisplay = 'Domani';
  } else {
    dateDisplay = format(matchDate, 'dd/MM/yyyy', { locale: it });
  }
  
  const timeDisplay = format(matchDate, 'HH:mm');
  
  // Controlla se un'opzione di scommessa è selezionata
  const isSelected = (outcome: '1' | 'X' | '2') => {
    return bets.some(b => b.matchId === match._id && b.outcome === outcome);
  };
  
  // Verifica se la partita è live
  const isLive = match.status === 'live';
  
  // Ottieni le migliori quote per questo match
  const bestOdds = {
    '1': match.homeOdds || 0,
    'X': match.drawOdds || 0,
    '2': match.awayOdds || 0
  };
  
  // Gestisci il click su una quota
  const handleOddsClick = (outcome: '1' | 'X' | '2') => {
    const existingBet = bets.find(b => b.matchId === match._id);
    
    if (existingBet && existingBet.outcome === outcome) {
      // Se è già selezionata, rimuovila
      removeBet(match._id);
    } else {
      // Altrimenti, aggiungila o aggiornala
      const newBet = {
        matchId: match._id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        outcome,
        odds: outcome === '1' ? bestOdds['1'] : outcome === 'X' ? bestOdds['X'] : bestOdds['2'],
        status: match.status,
        startTime: match.startTime
      };
      
      // Aggiungi alla schedina senza mostrare notifica
      addBet(newBet);
    }
  };
  
  // Visualizza più dettagli sulla partita
  const handleMatchClick = () => {
    setLocation(`/matches/${match._id}`);
  };
  
  return (
    <div className="border-b border-[#C4C4C6] py-3">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          {isLive && (
            <span className="text-xs bg-[#E84141]/10 text-[#E84141] font-medium px-2 py-0.5 rounded mr-2">LIVE</span>
          )}
          <span className="text-sm text-[#1C1C1E]/80">{dateDisplay} {timeDisplay}</span>
        </div>
        <span className="text-xs text-[#1C1C1E]/60">{match.league}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <div 
          className="flex-1 mr-3 cursor-pointer"
          onClick={handleMatchClick}
        >
          <div className="flex justify-between">
            <span className="text-sm font-medium text-[#1C1C1E]">{match.homeTeam}</span>
            {isLive && <span className="font-bold text-[#1C1C1E]">{match.homeScore}</span>}
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-[#1C1C1E]">{match.awayTeam}</span>
            {isLive && <span className="font-bold text-[#1C1C1E]">{match.awayScore}</span>}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant={isSelected('1') ? "default" : "outline"} 
            size="sm"
            className={`px-3 py-1 h-auto min-w-[40px] ${
              isSelected('1') 
                ? 'bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#1C1C1E] border-[#FFD700]' 
                : 'border-[#C4C4C6] text-[#1C1C1E] hover:bg-[#F5F5F7] hover:text-[#1C1C1E]'
            }`}
            onClick={() => handleOddsClick('1')}
          >
            <div className="flex flex-col items-center">
              <span className="text-xs">1</span>
              <span className="text-sm font-bold">{bestOdds['1'].toFixed(2)}</span>
            </div>
          </Button>
          
          <Button 
            variant={isSelected('X') ? "default" : "outline"} 
            size="sm"
            className={`px-3 py-1 h-auto min-w-[40px] ${
              isSelected('X') 
                ? 'bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#1C1C1E] border-[#FFD700]' 
                : 'border-[#C4C4C6] text-[#1C1C1E] hover:bg-[#F5F5F7] hover:text-[#1C1C1E]'
            }`}
            onClick={() => handleOddsClick('X')}
          >
            <div className="flex flex-col items-center">
              <span className="text-xs">X</span>
              <span className="text-sm font-bold">{bestOdds['X'].toFixed(2)}</span>
            </div>
          </Button>
          
          <Button 
            variant={isSelected('2') ? "default" : "outline"} 
            size="sm"
            className={`px-3 py-1 h-auto min-w-[40px] ${
              isSelected('2') 
                ? 'bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#1C1C1E] border-[#FFD700]' 
                : 'border-[#C4C4C6] text-[#1C1C1E] hover:bg-[#F5F5F7] hover:text-[#1C1C1E]'
            }`}
            onClick={() => handleOddsClick('2')}
          >
            <div className="flex flex-col items-center">
              <span className="text-xs">2</span>
              <span className="text-sm font-bold">{bestOdds['2'].toFixed(2)}</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}