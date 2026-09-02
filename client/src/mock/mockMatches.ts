export interface MockMatch {
  _id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  league: string;
  status: 'upcoming' | 'live' | 'completed';
  homeOdds?: number;
  drawOdds?: number;
  awayOdds?: number;
  homeScore?: number;
  awayScore?: number;
}

export const mockMatches: MockMatch[] = [
  {
    _id: '1',
    homeTeam: 'Inter',
    awayTeam: 'Milan',
    startTime: '2025-05-10T20:45:00.000Z',
    league: 'Serie A',
    status: 'upcoming',
    homeOdds: 2.10,
    drawOdds: 3.40,
    awayOdds: 3.20
  },
  {
    _id: '2',
    homeTeam: 'Juventus',
    awayTeam: 'Roma',
    startTime: '2025-05-11T18:00:00.000Z',
    league: 'Serie A',
    status: 'upcoming',
    homeOdds: 1.75,
    drawOdds: 3.60,
    awayOdds: 4.50
  },
  {
    _id: '3',
    homeTeam: 'Napoli',
    awayTeam: 'Lazio',
    startTime: '2025-05-11T15:00:00.000Z',
    league: 'Serie A',
    status: 'upcoming',
    homeOdds: 1.95,
    drawOdds: 3.30,
    awayOdds: 3.70
  },
  {
    _id: '4',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    startTime: '2025-05-05T20:30:00.000Z',
    league: 'La Liga',
    status: 'live',
    homeOdds: 1.70,
    drawOdds: 3.80,
    awayOdds: 4.20,
    homeScore: 2,
    awayScore: 1
  },
  {
    _id: '5',
    homeTeam: 'Atletico Madrid',
    awayTeam: 'Sevilla',
    startTime: '2025-05-05T18:45:00.000Z',
    league: 'La Liga',
    status: 'live',
    homeOdds: 1.90,
    drawOdds: 3.20,
    awayOdds: 4.00,
    homeScore: 0,
    awayScore: 0
  },
  {
    _id: '6',
    homeTeam: 'Manchester City',
    awayTeam: 'Manchester United',
    startTime: '2025-05-15T16:00:00.000Z',
    league: 'Premier League',
    status: 'upcoming',
    homeOdds: 1.65,
    drawOdds: 3.80,
    awayOdds: 5.00
  },
  {
    _id: '7',
    homeTeam: 'Liverpool',
    awayTeam: 'Chelsea',
    startTime: '2025-05-15T20:45:00.000Z',
    league: 'Premier League',
    status: 'upcoming',
    homeOdds: 1.90,
    drawOdds: 3.50,
    awayOdds: 3.80
  },
  {
    _id: '8',
    homeTeam: 'Arsenal',
    awayTeam: 'Tottenham',
    startTime: '2025-05-16T18:30:00.000Z',
    league: 'Premier League',
    status: 'upcoming',
    homeOdds: 2.05,
    drawOdds: 3.40,
    awayOdds: 3.30
  },
  {
    _id: '9',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Borussia Dortmund',
    startTime: '2025-05-14T20:30:00.000Z',
    league: 'Bundesliga',
    status: 'upcoming',
    homeOdds: 1.55,
    drawOdds: 4.20,
    awayOdds: 5.50
  },
  {
    _id: '10',
    homeTeam: 'PSG',
    awayTeam: 'Marseille',
    startTime: '2025-05-13T20:45:00.000Z',
    league: 'Ligue 1',
    status: 'upcoming',
    homeOdds: 1.45,
    drawOdds: 4.50,
    awayOdds: 6.50
  }
];

export function getUpcomingMatches(limit: number = 10): MockMatch[] {
  return mockMatches
    .filter(match => match.status === 'upcoming')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, limit);
}

export function getLiveMatches(): MockMatch[] {
  return mockMatches
    .filter(match => match.status === 'live');
}

export function getMatchesByLeague(league: string): MockMatch[] {
  return mockMatches
    .filter(match => match.league === league);
}

export function getMatchById(id: string): MockMatch | undefined {
  return mockMatches.find(match => match._id === id);
}