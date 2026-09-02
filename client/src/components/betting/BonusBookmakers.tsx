import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, X } from 'lucide-react';
import { bookmakers } from '@/mock/mockBookmakers';

export function BonusBookmakers() {
  const [showAllBookmakers, setShowAllBookmakers] = useState(false);
  
  // Mostra solo i primi 4 bookmaker oppure tutti
  const displayedBookmakers = showAllBookmakers ? bookmakers : bookmakers.slice(0, 4);
  
  return (
    <Card>
      <CardHeader className="bg-[#112244] text-white p-3">
        <CardTitle className="text-lg font-bold">Bonus Bookmakers</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {displayedBookmakers.map((bookmaker) => (
            <div key={bookmaker.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 flex items-center justify-center ${getBookmakerColor(bookmaker.id)} text-white font-bold rounded`}>
                    {bookmaker.logo || bookmaker.id.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium">{bookmaker.name}</h4>
                    <p className="text-xs text-gray-500">
                      {bookmaker.bonus?.replace(/€|Euro/gi, 'crediti')}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                  className="text-xs"
                >
                  <a href={bookmaker.link || '#'} target="_blank" rel="noopener noreferrer">
                    Registrati
                    <ExternalLink size={12} className="ml-1" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-3 bg-gray-50">
          {showAllBookmakers ? (
            <Button 
              variant="link" 
              className="w-full text-xs text-[#112244]"
              onClick={() => setShowAllBookmakers(false)}
            >
              Mostra meno bookmaker
              <X size={14} className="ml-1" />
            </Button>
          ) : (
            <Button 
              variant="link" 
              className="w-full text-xs text-[#112244]"
              onClick={() => setShowAllBookmakers(true)}
            >
              Vedi tutti i bookmaker
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Funzione per ottenere il colore di sfondo per il logo del bookmaker
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