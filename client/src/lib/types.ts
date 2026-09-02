export interface User {
  _id: string;
  id?: string; // Per compatibilità
  username: string;
  email: string;
  fullName: string;
  credits: number;
  createdAt: string;
  lastLogin?: string;
  roles?: string[];
  referralCode?: string;
  invitedUsers?: string[];
  phone?: string; // Campo opzionale per il profilo
  bio?: string; // Biografia utente
  profileImage?: string; // URL immagine profilo
}

export interface Tournament {
  _id: string;
  id?: string; // Per compatibilità
  nome: string;
  league: string;
  descrizione?: string;
  dataInizio: string;
  dataFine: string;
  isPaid: boolean;
  entryFee?: number;
  prize?: number;
  partecipanti: Array<{
    _id: string;
    userName: string;
    puntiTorneo: number;
  }>;
  status: "upcoming" | "active" | "completed";
}
export interface Match {
  _id: string;
  id?: string; // Per compatibilità
  tournamentId?: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  league: string;
  status: "upcoming" | "live" | "completed";
  result?: string;
  homeOdds?: number;
  drawOdds?: number;
  awayOdds?: number;
}

export interface Prediction {
  _id: string;
  id?: string; // Per compatibilità
  userId: string;
  matchId: string;
  prediction: "home" | "draw" | "away";
  points?: number | null;
  createdAt: string;
  isCorrect?: boolean | null;
  match?: Match;
}

export interface Badge {
  _id: string;
  id?: string; // Per compatibilità
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  reward?: number; // Crediti di ricompensa per il badge
}

export interface Referral {
  _id: string;
  id?: string; // Per compatibilità
  referrerId: string;
  referredEmail: string;
  status: "pending" | "completed" | "expired";
  createdAt: string;
  completedAt?: string | null;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  recoverPassword: (email: string) => Promise<void>;
  refetchUser: () => Promise<void>;
  loginMutation?: any;
  logoutMutation?: any;
  registerMutation?: any;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface PredictionStats {
  successRate: string;
  totalBets: number;
  profitLoss: number;
}
