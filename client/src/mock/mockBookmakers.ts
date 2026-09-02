export interface Bookmaker {
  id: string;
  name: string;
  logo?: string;
  bonus?: string;
  link?: string;
}

export const bookmakers: Bookmaker[] = [
  {
    id: 'bet365',
    name: 'Bet365',
    bonus: 'Fino a 100 crediti',
    link: '#'
  },
  {
    id: 'snai',
    name: 'Snai',
    bonus: '15 crediti gratis + 300 crediti sul primo deposito',
    link: '#'
  },
  {
    id: 'betway',
    name: 'Betway',
    bonus: 'Fino a 50 crediti sul primo deposito',
    link: '#'
  },
  {
    id: 'williamhill',
    name: 'William Hill',
    bonus: 'Quota maggiorata a 30.00',
    link: '#'
  },
  {
    id: 'goldbet',
    name: 'GoldBet',
    bonus: 'Fino a 500 crediti sul primo deposito',
    link: '#'
  },
  {
    id: 'leovegas',
    name: 'LeoVegas',
    bonus: 'Fino a 1000 crediti + 200 Free Spins',
    link: '#'
  },
  {
    id: 'betsson',
    name: 'Betsson',
    bonus: 'Fino a 100 crediti sul primo deposito',
    link: '#'
  },
  {
    id: 'admiralbet',
    name: 'AdmiralBet',
    bonus: '100 crediti sul primo deposito',
    link: '#'
  },
  {
    id: 'netbet',
    name: 'NetBet',
    bonus: '50 crediti + 200 Free Spins',
    link: '#'
  },
  {
    id: 'vincitu',
    name: 'Vincitù',
    bonus: 'Fino a 200 crediti sul primo deposito',
    link: '#'
  },
  {
    id: 'netwin',
    name: 'NetWin',
    bonus: '10 crediti senza deposito + 1.000 crediti sul primo deposito',
    link: '#'
  }
];