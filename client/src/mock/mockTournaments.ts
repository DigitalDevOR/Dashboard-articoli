export interface TournamentParticipation {
  userId: string;
  tournamentId: string;
  joinedAt: Date;
}

/**
 * Funzione per memorizzare l'iscrizione di un utente a un torneo nel localStorage
 * Nota: Questa è una versione locale per il fallback offline, utilizzare l'API server quando possibile
 */
export function joinTournament(userId: string, tournamentId: string): void {
  // Recupera tutte le partecipazioni esistenti
  const participations = getParticipations();
  
  // Verifica se l'utente è già iscritto
  const alreadyJoined = participations.some(
    p => p.userId === userId && p.tournamentId === tournamentId
  );
  
  // Se non è già iscritto, aggiungi la nuova partecipazione
  if (!alreadyJoined) {
    participations.push({
      userId,
      tournamentId,
      joinedAt: new Date()
    });
    
    // Salva le partecipazioni aggiornate
    localStorage.setItem('tournament_participations', JSON.stringify(participations));
  }
}

/**
 * Funzione per rimuovere l'iscrizione di un utente a un torneo nel localStorage
 * Nota: Questa è una versione locale per il fallback offline, utilizzare l'API server quando possibile
 */
export function leaveTournament(userId: string, tournamentId: string): boolean {
  // Recupera tutte le partecipazioni esistenti
  const participations = getParticipations();
  
  // Trova l'indice della partecipazione da rimuovere
  const index = participations.findIndex(
    p => p.userId === userId && p.tournamentId === tournamentId
  );
  
  // Se la partecipazione esiste, rimuovila
  if (index !== -1) {
    participations.splice(index, 1);
    
    // Salva le partecipazioni aggiornate
    localStorage.setItem('tournament_participations', JSON.stringify(participations));
    return true;
  }
  
  return false;
}

/**
 * Funzione per verificare se un utente è iscritto a un torneo
 */
export function isParticipatingInTournament(userId: string | undefined, tournamentId: string): boolean {
  if (!userId) return false;
  
  const participations = getParticipations();
  return participations.some(
    p => p.userId === userId && p.tournamentId === tournamentId
  );
}

/**
 * Funzione per ottenere tutti i tornei a cui un utente è iscritto
 */
export function getUserTournamentIds(userId: string | undefined): string[] {
  if (!userId) return [];
  
  const participations = getParticipations();
  return participations
    .filter(p => p.userId === userId)
    .map(p => p.tournamentId);
}

/**
 * Funzione interna per recuperare le partecipazioni dal localStorage
 */
function getParticipations(): TournamentParticipation[] {
  const data = localStorage.getItem('tournament_participations');
  if (!data) return [];
  
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.map(p => ({
      ...p,
      joinedAt: new Date(p.joinedAt)
    })) : [];
  } catch (e) {
    console.error('Errore nel parsing delle partecipazioni ai tornei:', e);
    return [];
  }
}