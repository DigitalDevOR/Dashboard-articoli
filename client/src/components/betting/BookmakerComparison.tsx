import React from 'react';
import { MockMatch } from '@/mock/mockMatches';
import { matchOdds } from '@/mock/mockOdds';
import { bookmakers } from '@/mock/mockBookmakers';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

interface BookmakerComparisonProps {
  match: MockMatch;
}

export function BookmakerComparison({ match }: BookmakerComparisonProps) {
  // Ottieni tutte le quote dei bookmaker per questa partita
  const odds = matchOdds.find(m => m.matchId === match._id);
  
  if (!odds) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-center text-gray-500">Quote non disponibili per questa partita</p>
        </CardContent>
      </Card>
    );
  }
  
  // Mappa gli ID dei bookmaker ai loro nomi completi
  const bookmakerMap = Object.fromEntries(
    bookmakers.map(b => [b.id, b])
  );
  
  return (
    <Card className="overflow-hidden">
      <div className="bg-blue-800 text-white p-3">
        <h3 className="font-bold">Confronta Quote</h3>
      </div>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left font-medium">Bookmaker</th>
                <th className="p-3 text-center font-medium">1</th>
                <th className="p-3 text-center font-medium">X</th>
                <th className="p-3 text-center font-medium">2</th>
              </tr>
            </thead>
            <tbody>
              {odds.odds.map((bookmakerOdds, index) => {
                const bookmaker = bookmakerMap[bookmakerOdds.bookmaker];
                
                return (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 flex items-center justify-center ${getBookmakerColor(bookmakerOdds.bookmaker)} text-white font-bold rounded text-xs`}>
                          {bookmaker?.logo || bookmakerOdds.bookmaker.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{bookmaker?.name || bookmakerOdds.bookmaker}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-medium">
                      {bookmakerOdds.odds['1']?.toFixed(2) || '-'}
                    </td>
                    <td className="p-3 text-center font-medium">
                      {bookmakerOdds.odds['X']?.toFixed(2) || '-'}
                    </td>
                    <td className="p-3 text-center font-medium">
                      {bookmakerOdds.odds['2']?.toFixed(2) || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// Funzione per assegnare colori ai bookmaker (duplicata da BonusBookmakers)
function getBookmakerColor(id: string): string {
  const colors: Record<string, string> = {
    'netbet': 'bg-black',
    'betsson': 'bg-orange-500',
    'bet365': 'bg-green-600',
    'netwin': 'bg-black',
    'admiralbet': 'bg-blue-800',
    'williamhill': 'bg-blue-900',
    'betway': 'bg-black',
    'vincitu': 'bg-yellow-500',
    'snai': 'bg-gray-700',
    'leovegas': 'bg-orange-600',
    'goldbet': 'bg-yellow-600'
  };
  
  return colors[id] || 'bg-gray-500';
}