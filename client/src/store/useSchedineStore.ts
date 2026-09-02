import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipo per le scommesse
export type BetType = '1' | 'X' | '2';

// Interfaccia per una scommessa
export interface Bet {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  outcome: BetType;
  odds: number;
  status: 'upcoming' | 'live' | 'completed';
  startTime: string;
}

// Aggiunta tipo per la schedina
export type BetStatus = 'pending' | 'won' | 'lost';

// Interfaccia per un pronostico completo con stato
export interface CompletedBet extends Omit<Bet, 'status'> {
  placed: string; // data di quando è stato piazzato
  status: BetStatus; // Sovrascriviamo il tipo di status
  stakeAmount: number;
  potentialWin: number;
  tournamentId?: string;
  tournamentName?: string;
  matchStatus?: 'upcoming' | 'live' | 'completed'; // Manteniamo lo stato del match separato
}

// Interfaccia per lo stato dello store
interface SchedineState {
  // Stato visibilità schedina
  isOpen: boolean;
  toggleSchedina: () => void;
  openSchedina: () => void;
  closeSchedina: () => void;
  
  // Scommesse attuali nella schedina
  bets: Bet[];
  stake: number;
  addBet: (bet: Bet) => void;
  removeBet: (matchId: string) => void;
  clearBets: () => void;
  setStake: (amount: number) => void;
  potentialWinnings: () => number;
  totalOdds: () => number;
  
  // Storico pronostici
  betHistory: CompletedBet[];
  addToBetHistory: () => void;
  getBetHistory: () => CompletedBet[];
}

// Crea lo store con persistenza
export const useSchedineStore = create<SchedineState>()(
  persist(
    (set, get) => ({
      // Stato iniziale
      bets: [],
      stake: 2, // Default è 2€
      isOpen: false, // La schedina inizialmente è chiusa
      betHistory: [], // Nessuna scommessa piazzata inizialmente
      
      // Controllo visibilità schedina
      toggleSchedina: () => set((state) => ({ isOpen: !state.isOpen })),
      openSchedina: () => set({ isOpen: true }),
      closeSchedina: () => set({ isOpen: false }),
      
      // Aggiungi o aggiorna una scommessa (e apri la schedina)
      addBet: (bet) => set((state) => {
        // Controlla se la scommessa esiste già con lo stesso outcome
        const existingBet = state.bets.find(b => 
          b.matchId === bet.matchId && b.outcome === bet.outcome
        );
        
        // Se esiste già esattamente la stessa scommessa, non fare nulla
        if (existingBet) {
          return state;
        }
        
        // Rimuovi scommesse esistenti per lo stesso match
        const filteredBets = state.bets.filter(b => b.matchId !== bet.matchId);
        // Aggiungi la nuova scommessa e apri la schedina
        return { 
          bets: [...filteredBets, bet],
          isOpen: true // Apri automaticamente la schedina
        };
      }),
      
      // Rimuovi una scommessa
      removeBet: (matchId) => set((state) => ({
        bets: state.bets.filter(bet => bet.matchId !== matchId)
      })),
      
      // Cancella tutte le scommesse
      clearBets: () => set({ bets: [] }),
      
      // Imposta la puntata
      setStake: (amount) => set({ stake: amount }),
      
      // Calcola la vincita potenziale
      potentialWinnings: () => {
        const state = get();
        return state.stake * state.totalOdds();
      },
      
      // Calcola la quota totale
      totalOdds: () => {
        const state = get();
        if (state.bets.length === 0) return 0;
        
        // Moltiplica tutte le quote tra loro
        return state.bets.reduce((acc, bet) => acc * bet.odds, 1);
      },
      
      // Aggiunge le scommesse attuali allo storico
      addToBetHistory: () => set((state) => {
        const { bets, stake, potentialWinnings, totalOdds } = get();
        
        if (bets.length === 0) return state;
        
        // Crea nuovi oggetti CompletedBet dallo stato attuale
        const newBetHistory = bets.map(bet => {
          // Estrai lo stato del match originale
          const { status: matchStatus, ...restBet } = bet;
          
          // Crea un nuovo CompletedBet con lo status corretto
          return {
            ...restBet,
            matchStatus: matchStatus, // Salva lo stato originale in matchStatus
            placed: new Date().toISOString(),
            status: 'pending' as BetStatus, // Usa il nuovo tipo
            stakeAmount: bets.length > 1 
              ? stake / bets.length // Dividi la puntata se è una multipla
              : stake,
            potentialWin: bets.length > 1 
              ? potentialWinnings() // Se è una multipla, usa il calcolo complessivo
              : stake * bet.odds // Se è singola, calcola solo per questa scommessa
          };
        });
        
        // Aggiungi le nuove scommesse allo storico esistente
        return {
          betHistory: [...state.betHistory, ...newBetHistory],
          bets: [], // Svuota la schedina attiva
          isOpen: false // Chiudi la schedina
        };
      }),
      
      // Restituisce lo storico delle scommesse
      getBetHistory: () => get().betHistory
    }),
    {
      name: 'schedine-storage' // Nome per il localStorage
    }
  )
);