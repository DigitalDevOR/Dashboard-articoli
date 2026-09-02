import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/lib/types';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { formatDate, getBadgeIcon } from '@/lib/utils';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';

// Definizione del tipo per i badge personalizzati
interface CustomBadge extends Badge {
  reward?: number;
}

// Badge personalizzati da sbloccare
const unlockedBadges: CustomBadge[] = [
  {
    _id: 'custom-1',
    id: 'custom-1',
    name: 'Primo Pronostico',
    description: 'Effettua il tuo primo pronostico',
    icon: 'ri-line-chart-line',
    reward: 5
  },
  {
    _id: 'custom-2',
    id: 'custom-2',
    name: 'Collezionista',
    description: 'Iscriviti a 3 tornei diversi',
    icon: 'ri-trophy-line',
    reward: 10
  },
  {
    _id: 'custom-3',
    id: 'custom-3',
    name: 'Fedeltà',
    description: 'Accedi 5 giorni consecutivi',
    icon: 'ri-calendar-check-line',
    reward: 10
  }
];

export default function BadgesPage() {
  const [, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState<'earned' | 'locked'>('earned');

  // Fetch user badges
  const { data: userBadges, isLoading: userBadgesLoading } = useQuery<(Badge & { earnedAt: string })[]>({
    queryKey: ['/api/badges/me'],
  });

  // Fetch all badges
  const { data: allBadges, isLoading: allBadgesLoading } = useQuery<Badge[]>({
    queryKey: ['/api/badges'],
  });

  // Get badges to display based on filter
  const getDisplayBadges = () => {
    if (activeFilter === 'earned') {
      return userBadges || [];
    } else {
      // Se sono i badge bloccati, mostriamo anche quelli personalizzati
      if (allBadges && userBadges) {
        const earnedBadgeIds = userBadges.map(b => b._id || b.id);
        const lockedServerBadges = allBadges.filter(b => !earnedBadgeIds.includes(b._id || b.id));
        
        // Combiniamo i badge del server con quelli personalizzati
        return [...lockedServerBadges, ...unlockedBadges];
      }
      return unlockedBadges;
    }
  };

  const displayBadges = getDisplayBadges();
  const isLoading = userBadgesLoading || allBadgesLoading;

  return (
    <div className="page-container bg-neutral-50">
      <Header 
        showBackButton={true} 
        title="Badge"
        backDestination="/profile"
      />
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <button 
            className={`badge-pill ${activeFilter === 'earned' ? 'active' : 'inactive'}`}
            onClick={() => setActiveFilter('earned')}
          >
            Badge Ottenuti
          </button>
          <button 
            className={`badge-pill ${activeFilter === 'locked' ? 'active' : 'inactive'}`}
            onClick={() => setActiveFilter('locked')}
          >
            Da Sbloccare
          </button>
        </div>
        
        {isLoading ? (
          <div className="animate-pulse grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg h-40"></div>
            ))}
          </div>
        ) : displayBadges.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {displayBadges.map((badge) => (
              <div key={badge.id} className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center">
                <div className="w-16 h-16 flex items-center justify-center bg-yellow-100 rounded-full mb-2">
                  <i className={`${getBadgeIcon(badge.icon)} text-yellow-500 text-2xl`}></i>
                </div>
                <h3 className="font-semibold text-primary text-center">{badge.name}</h3>
                <p className="text-xs text-gray-500 text-center mt-1">{badge.description}</p>
                {badge.earnedAt ? (
                  <span className="text-xs text-gray-400 mt-2">
                    Sbloccato il {formatDate(new Date(badge.earnedAt))}
                  </span>
                ) : badge.reward ? (
                  <div className="mt-2 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                    +{badge.reward} crediti
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {activeFilter === 'earned' 
              ? 'Non hai ancora ottenuto badge. Continua a giocare per sbloccarli!' 
              : 'Hai già sbloccato tutti i badge disponibili. Complimenti!'}
          </div>
        )}
      </div>
      
      <BottomNavigation activeItem="profile" />
    </div>
  );
}
