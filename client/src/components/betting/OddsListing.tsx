import React from 'react';
import { MockMatch } from '@/mock/mockMatches';
import { MatchOddsRow } from './MatchOddsRow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OddsListingProps {
  matches: MockMatch[];
  title?: string;
  showTabs?: boolean;
}

export function OddsListing({ matches, title, showTabs = true }: OddsListingProps) {
  // Raggruppa le partite per lega
  const matchesByLeague: Record<string, MockMatch[]> = {};
  
  matches.forEach(match => {
    if (!matchesByLeague[match.league]) {
      matchesByLeague[match.league] = [];
    }
    matchesByLeague[match.league].push(match);
  });
  
  // Ottieni tutte le leghe disponibili
  const leagues = Object.keys(matchesByLeague);
  
  return (
    <div className="bg-white rounded-md shadow-md overflow-hidden">
      {title && (
        <div className="bg-blue-800 text-white p-3">
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
      )}
      
      {showTabs && leagues.length > 1 ? (
        <Tabs defaultValue={leagues[0]} className="w-full">
          <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${leagues.length}, 1fr)` }}>
            {leagues.map(league => (
              <TabsTrigger key={league} value={league}>{league}</TabsTrigger>
            ))}
          </TabsList>
          
          {leagues.map(league => (
            <TabsContent key={league} value={league} className="p-2">
              {matchesByLeague[league].map(match => (
                <MatchOddsRow key={match._id} match={match} />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="p-2">
          {matches.map(match => (
            <MatchOddsRow key={match._id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}