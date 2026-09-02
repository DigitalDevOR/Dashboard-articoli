export interface MatchOddsData {
  matchId: string;
  odds: {
    bookmaker: string;
    odds: {
      '1'?: number;
      'X'?: number;
      '2'?: number;
      'under2.5'?: number;
      'over2.5'?: number;
      'gg'?: number;
      'ng'?: number;
    };
  }[];
}

// Funzione per ottenere le migliori quote per una partita
export function getBestOddsForMatch(matchId: string) {
  const match = matchOdds.find(m => m.matchId === matchId);
  
  if (!match) {
    return {
      '1': undefined,
      'X': undefined,
      '2': undefined
    };
  }
  
  // Trova le migliori quote 1-X-2 tra tutti i bookmaker
  const bestOdds = {
    '1': Math.max(...match.odds.map(o => o.odds['1'] || 0)),
    'X': Math.max(...match.odds.map(o => o.odds['X'] || 0)),
    '2': Math.max(...match.odds.map(o => o.odds['2'] || 0))
  };
  
  return bestOdds;
}

export const matchOdds: MatchOddsData[] = [
  {
    matchId: '1',
    odds: [
      {
        bookmaker: 'bet365',
        odds: {
          '1': 2.10,
          'X': 3.40,
          '2': 3.20,
          'under2.5': 1.85,
          'over2.5': 1.95,
          'gg': 1.75,
          'ng': 2.05
        }
      },
      {
        bookmaker: 'snai',
        odds: {
          '1': 2.15,
          'X': 3.35,
          '2': 3.25,
          'under2.5': 1.80,
          'over2.5': 2.00,
          'gg': 1.70,
          'ng': 2.10
        }
      },
      {
        bookmaker: 'betway',
        odds: {
          '1': 2.05,
          'X': 3.45,
          '2': 3.15,
          'under2.5': 1.90,
          'over2.5': 1.90,
          'gg': 1.80,
          'ng': 2.00
        }
      },
      {
        bookmaker: 'goldbet',
        odds: {
          '1': 2.12,
          'X': 3.38,
          '2': 3.22,
          'under2.5': 1.87,
          'over2.5': 1.93,
          'gg': 1.77,
          'ng': 2.03
        }
      },
      {
        bookmaker: 'williamhill',
        odds: {
          '1': 2.08,
          'X': 3.42,
          '2': 3.18,
          'under2.5': 1.88,
          'over2.5': 1.92,
          'gg': 1.76,
          'ng': 2.04
        }
      }
    ]
  },
  {
    matchId: '2',
    odds: [
      {
        bookmaker: 'bet365',
        odds: {
          '1': 1.75,
          'X': 3.60,
          '2': 4.50,
          'under2.5': 1.90,
          'over2.5': 1.90,
          'gg': 1.85,
          'ng': 1.95
        }
      },
      {
        bookmaker: 'snai',
        odds: {
          '1': 1.80,
          'X': 3.55,
          '2': 4.40,
          'under2.5': 1.85,
          'over2.5': 1.95,
          'gg': 1.80,
          'ng': 2.00
        }
      },
      {
        bookmaker: 'leovegas',
        odds: {
          '1': 1.73,
          'X': 3.65,
          '2': 4.55,
          'under2.5': 1.92,
          'over2.5': 1.88,
          'gg': 1.87,
          'ng': 1.93
        }
      },
      {
        bookmaker: 'betway',
        odds: {
          '1': 1.78,
          'X': 3.58,
          '2': 4.45,
          'under2.5': 1.87,
          'over2.5': 1.93,
          'gg': 1.83,
          'ng': 1.97
        }
      }
    ]
  },
  {
    matchId: '3',
    odds: [
      {
        bookmaker: 'bet365',
        odds: {
          '1': 1.95,
          'X': 3.30,
          '2': 3.70,
          'under2.5': 2.00,
          'over2.5': 1.80,
          'gg': 1.70,
          'ng': 2.10
        }
      },
      {
        bookmaker: 'snai',
        odds: {
          '1': 2.00,
          'X': 3.25,
          '2': 3.65,
          'under2.5': 1.95,
          'over2.5': 1.85,
          'gg': 1.65,
          'ng': 2.15
        }
      },
      {
        bookmaker: 'admiralbet',
        odds: {
          '1': 1.93,
          'X': 3.32,
          '2': 3.75,
          'under2.5': 2.05,
          'over2.5': 1.75,
          'gg': 1.72,
          'ng': 2.08
        }
      }
    ]
  },
  {
    matchId: '4',
    odds: [
      {
        bookmaker: 'bet365',
        odds: {
          '1': 1.70,
          'X': 3.80,
          '2': 4.20,
          'under2.5': 2.10,
          'over2.5': 1.70,
          'gg': 1.60,
          'ng': 2.30
        }
      },
      {
        bookmaker: 'betway',
        odds: {
          '1': 1.75,
          'X': 3.75,
          '2': 4.15,
          'under2.5': 2.05,
          'over2.5': 1.75,
          'gg': 1.55,
          'ng': 2.35
        }
      },
      {
        bookmaker: 'williamhill',
        odds: {
          '1': 1.68,
          'X': 3.85,
          '2': 4.25,
          'under2.5': 2.15,
          'over2.5': 1.65,
          'gg': 1.58,
          'ng': 2.32
        }
      }
    ]
  },
  {
    matchId: '5',
    odds: [
      {
        bookmaker: 'bet365',
        odds: {
          '1': 1.90,
          'X': 3.20,
          '2': 4.00,
          'under2.5': 1.80,
          'over2.5': 2.00,
          'gg': 1.90,
          'ng': 1.90
        }
      },
      {
        bookmaker: 'snai',
        odds: {
          '1': 1.95,
          'X': 3.15,
          '2': 3.95,
          'under2.5': 1.75,
          'over2.5': 2.05,
          'gg': 1.85,
          'ng': 1.95
        }
      },
      {
        bookmaker: 'goldbet',
        odds: {
          '1': 1.87,
          'X': 3.25,
          '2': 4.05,
          'under2.5': 1.82,
          'over2.5': 1.98,
          'gg': 1.92,
          'ng': 1.88
        }
      }
    ]
  }
];