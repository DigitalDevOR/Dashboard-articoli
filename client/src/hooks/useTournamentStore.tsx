import { create } from 'zustand';
import { Tournament } from '@/lib/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useCallback } from 'react';

// Stato centralizzato per i tornei a cui l'utente partecipa
interface TournamentParticipationState {
  // Lista degli ID dei tornei a cui l'utente partecipa
  participatingTournaments: string[];
  // Aggiunge un torneo alla lista
  addParticipation: (tournamentId: string) => void;
  // Rimuove un torneo dalla lista
  removeParticipation: (tournamentId: string) => void;
  // Imposta completamente la lista dei tornei
  setParticipations: (tournamentIds: string[]) => void;
  // Verifica se l'utente partecipa a un torneo specifico
  isParticipating: (tournamentId: string) => boolean;
  // Svuota la lista dei tornei (utile per logout)
  clearParticipations: () => void;
}

// Crea lo store con Zustand
export const useTournamentStore = create<TournamentParticipationState>((set, get) => ({
  participatingTournaments: [],
  
  addParticipation: (tournamentId) => 
    set((state) => ({
      participatingTournaments: state.participatingTournaments.includes(tournamentId) 
        ? state.participatingTournaments 
        : [...state.participatingTournaments, tournamentId]
    })),
    
  removeParticipation: (tournamentId) => 
    set((state) => ({
      participatingTournaments: state.participatingTournaments.filter(id => id !== tournamentId)
    })),
    
  setParticipations: (tournamentIds) => {
    // Preveniamo loop infiniti controllando se i dati sono effettivamente cambiati
    const uniqueIds = Array.from(new Set(tournamentIds));
    set((state) => {
      // Confrontiamo gli array per vedere se sono uguali
      const currentIds = state.participatingTournaments;
      if (currentIds.length !== uniqueIds.length) {
        return { participatingTournaments: uniqueIds };
      }
      
      // Controlliamo se tutti gli elementi sono uguali
      const areEqual = currentIds.every(id => uniqueIds.includes(id)) && 
                       uniqueIds.every(id => currentIds.includes(id));
      
      if (areEqual) {
        return state; // Non fare nulla se gli array sono identici
      }
      
      return { participatingTournaments: uniqueIds };
    });
  },
    
  isParticipating: (tournamentId) => 
    get().participatingTournaments.includes(tournamentId),
    
  clearParticipations: () => {
    // La versione precedente causava loop infiniti
    // Preveniamo aggiornamenti non necessari verificando se l'array è già vuoto
    set((state) => {
      if (state.participatingTournaments.length === 0) {
        // Se è già vuoto, non fare nulla
        return state;
      }
      // Altrimenti svuota l'array
      return { participatingTournaments: [] };
    });
  },
}));

/**
 * Hook per recuperare e sincronizzare i tornei dell'utente
 */
export function useUserTournaments() {
  const { user } = useAuth();
  const tournamentStore = useTournamentStore();
  const queryClient = useQueryClient();
  
  // Query per ottenere i tornei dell'utente
  const { 
    data: userTournaments, 
    isLoading, 
    refetch 
  } = useQuery<Tournament[]>({
    queryKey: ['/api/user/tournaments'],
    enabled: !!user,
    refetchInterval: false, // Disattivato il polling automatico per evitare loop infiniti
    staleTime: 5000,
    refetchOnWindowFocus: true
  });
  
  // Quando i tornei cambiano, aggiorna lo store centralizzato
  useEffect(() => {
    // Controllo per evitare cicli infiniti
    if (!userTournaments) return;
    
    if (userTournaments.length > 0) {
      const tournamentIds = userTournaments.map(t => t._id || t.id || '').filter(Boolean);
      // Verifichiamo se ci sono effettivi cambiamenti prima di aggiornare lo store
      const currentIds = tournamentStore.participatingTournaments;
      
      // Confrontiamo gli array
      const needsUpdate = 
        currentIds.length !== tournamentIds.length || 
        !currentIds.every(id => tournamentIds.includes(id)) || 
        !tournamentIds.every(id => currentIds.includes(id));
      
      if (needsUpdate) {
        tournamentStore.setParticipations(tournamentIds);
      }
    } else if (userTournaments.length === 0 && tournamentStore.participatingTournaments.length > 0) {
      // Se la risposta è una lista vuota e lo store ha elementi, pulisci lo store
      tournamentStore.clearParticipations();
    }
  }, [userTournaments]);
  
  // Quando l'utente cambia o si disconnette, gestisci lo store di conseguenza
  useEffect(() => {
    if (!user) {
      // Solo se ci sono partecipazioni da cancellare
      if (tournamentStore.participatingTournaments.length > 0) {
        tournamentStore.clearParticipations();
      }
    } else {
      // Facciamo il fetch solo una volta all'avvio
      const shouldFetch = !userTournaments;
      if (shouldFetch) {
        refetch();
      }
    }
  }, [user]);
  
  // Funzione per forzare l'aggiornamento dei dati
  const refreshTournaments = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/user/tournaments'] });
    refetch();
  }, [queryClient, refetch]);
  
  return {
    userTournaments,
    isLoading,
    refreshTournaments,
    isParticipating: tournamentStore.isParticipating
  };
}

/**
 * Versione semplificata per verificare solo la partecipazione senza richiedere dati
 */
export function useIsParticipating(tournamentId: string | undefined) {
  const tournamentStore = useTournamentStore();
  
  return {
    isParticipating: tournamentId ? tournamentStore.isParticipating(tournamentId) : false
  };
}