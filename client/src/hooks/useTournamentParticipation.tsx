import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useTournamentStore } from './useTournamentStore';

/**
 * Hook per gestire la partecipazione dell'utente ai tornei
 */
export function useTournamentParticipation(tournamentId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  
  // Ottieni lo stato e le funzioni dallo store centralizzato
  const {
    addParticipation,
    removeParticipation,
    isParticipating: checkIsParticipating
  } = useTournamentStore();
  
  // Query per verificare se l'utente è iscritto al torneo
  const { data: isParticipatingData, refetch } = useQuery<boolean>({
    queryKey: [`/api/tournaments/${tournamentId}/participants/me`],
    enabled: !!user && !!tournamentId,
    // Non conserviamo la cache quando il componente si smonta
    gcTime: 0, 
    staleTime: 0 // Considera sempre i dati obsoleti
  });
  
  // Aggiorna lo store quando cambia il valore della partecipazione
  useEffect(() => {
    if (isParticipatingData === true) {
      addParticipation(tournamentId);
    } else if (isParticipatingData === false) {
      removeParticipation(tournamentId);
    }
  }, [isParticipatingData, tournamentId, addParticipation, removeParticipation]);
  
  // Mutation per unirsi a un torneo
  const joinTournamentMutation = useMutation({
    mutationFn: async () => {
      setProcessing(true);
      const response = await apiRequest('POST', `/api/tournaments/${tournamentId}/join`);
      return await response.json();
    },
    onSuccess: () => {
      // Aggiorna lo store centralizzato immediatamente
      addParticipation(tournamentId);
      
      // Invalida tutte le query correlate
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}/participants/me`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}/participants`] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/tournaments'] });
      
      // Forza un aggiornamento immediato dello stato
      refetch();
      
      toast({
        title: 'Sei entrato nel torneo!',
        description: 'Puoi ora iniziare a fare previsioni.',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile unirsi al torneo. Riprova più tardi.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setProcessing(false);
    }
  });

  // Mutation per lasciare un torneo
  const leaveTournamentMutation = useMutation({
    mutationFn: async () => {
      setProcessing(true);
      const response = await apiRequest('POST', `/api/tournaments/${tournamentId}/leave`);
      return await response.json();
    },
    onSuccess: (data) => {
      // Aggiorna lo store centralizzato immediatamente
      removeParticipation(tournamentId);
      
      // Invalida tutte le query correlate
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}/participants/me`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}/participants`] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/tournaments'] });
      
      // Forza un aggiornamento immediato dello stato
      refetch();
      
      // Notifica di rimborso se applicabile
      if (data?.refunded && data?.credits) {
        toast({
          title: 'Hai lasciato il torneo',
          description: `Hai ricevuto un rimborso di ${data.credits} crediti.`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Hai lasciato il torneo',
          description: 'Ti sei ritirato con successo dal torneo.',
          variant: 'default',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile lasciare il torneo. Riprova più tardi.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setProcessing(false);
    }
  });

  // Funzione per gestire l'iscrizione o l'abbandono del torneo
  const toggleParticipation = async () => {
    if (!user) {
      // L'utente deve essere autenticato per partecipare
      toast({
        title: 'Accesso richiesto',
        description: 'Effettua l\'accesso o registrati per partecipare ai tornei.',
        variant: 'default',
      });
      return false;
    }

    if (processing) {
      return false; // Evita chiamate multiple
    }

    try {
      // Usa lo stato combinato per decidere l'azione (API + store locale)
      const currentlyParticipating = !!isParticipatingData || checkIsParticipating(tournamentId);
      
      if (currentlyParticipating) {
        await leaveTournamentMutation.mutateAsync();
      } else {
        await joinTournamentMutation.mutateAsync();
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  // Combina lo stato dell'API con lo stato dello store centralizzato
  const isCurrentlyParticipating = !!isParticipatingData || checkIsParticipating(tournamentId);

  return {
    isParticipating: isCurrentlyParticipating,
    toggleParticipation,
    joinTournament: joinTournamentMutation.mutate,
    leaveTournament: leaveTournamentMutation.mutate,
    isProcessing: processing,
    refetchParticipationStatus: refetch
  };
}