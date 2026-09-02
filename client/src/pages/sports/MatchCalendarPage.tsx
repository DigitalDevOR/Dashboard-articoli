import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Match } from '@/lib/types';
import { formatDate, formatTime } from '@/lib/utils';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import MatchCard from '@/components/common/MatchCard';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function MatchCalendarPage() {
  const [, setLocation] = useLocation();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Format the selected date to YYYY-MM-DD for API
  const formattedDate = date ? date.toISOString().split('T')[0] : undefined;
  
  // Fetch matches for the selected date
  const { data: matches, isLoading } = useQuery<Match[]>({
    queryKey: ['/api/matches/byDate', formattedDate],
    enabled: !!formattedDate,
  });
  
  // Group matches by league
  const matchesByLeague = matches?.reduce((groups, match) => {
    const league = match.league;
    if (!groups[league]) {
      groups[league] = [];
    }
    groups[league].push(match);
    return groups;
  }, {} as Record<string, Match[]>) || {};
  
  return (
    <div className="page-container bg-neutral-50">
      <Header 
        showBackButton={true} 
        title="Calendario Partite"
        backDestination="/sports"
      />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">
            Partite del {date ? formatDate(date) : 'Oggi'}
          </h2>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-auto flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline-block">Calendario</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white h-32 rounded-lg"></div>
            ))}
          </div>
        ) : matches && matches.length > 0 ? (
          Object.entries(matchesByLeague).map(([league, leagueMatches]) => (
            <div key={league} className="mb-6">
              <div className="flex items-center mb-2">
                <span className="font-medium text-gray-700">{league}</span>
                <span className="text-xs text-gray-500 ml-2">{leagueMatches.length} partite</span>
              </div>
              
              <div className="space-y-3">
                {leagueMatches.map((match) => (
                  <div 
                    key={match.id} 
                    className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
                    onClick={() => setLocation(`/matches/${match.id}`)}
                  >
                    <MatchCard match={match} />
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm">
            <i className="ri-calendar-line text-3xl text-gray-300 mb-2"></i>
            <p>Nessuna partita programmata</p>
            <p className="text-sm mt-1">Non ci sono partite per la data selezionata</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setDate(new Date())}
            >
              Torna a Oggi
            </Button>
          </div>
        )}
      </div>
      
      <BottomNavigation activeItem="sport" />
    </div>
  );
}