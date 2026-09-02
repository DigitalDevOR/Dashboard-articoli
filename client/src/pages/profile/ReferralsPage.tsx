import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { formatDate } from '@/lib/utils';
import { Share2, Copy, Gift, Users } from 'lucide-react';

// Definisci l'interfaccia per i referral
interface Referral {
  _id: string;
  id: string;
  referrerId: string;
  email: string;
  status: 'pending' | 'completed';
  createdAt: string;
  completedAt?: string;
}

export default function ReferralsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Genera un link di referral basato sull'ID dell'utente
  const referralLink = user ? `${window.location.origin}/register?ref=${user.id}` : '';
  
  // Fetch degli inviti dell'utente
  const { data: referrals, isLoading } = useQuery<Referral[]>({
    queryKey: ['/api/referrals'],
    enabled: !!user,
  });
  
  // Funzione per copiare il link negli appunti
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        setCopied(true);
        toast({
          title: "Link copiato",
          description: "Il link di invito è stato copiato negli appunti",
        });
        
        // Reset dello stato copied dopo 2 secondi
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        toast({
          title: "Errore",
          description: "Impossibile copiare il link",
          variant: "destructive",
        });
      });
  };
  
  // Funzione per condividere il link
  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Unisciti a Bet Master League',
        text: 'Registrati su Bet Master League e ottieni subito 10 crediti!',
        url: referralLink,
      })
      .catch(error => {
        toast({
          title: "Errore",
          description: "Impossibile condividere il link",
          variant: "destructive",
        });
      });
    } else {
      copyToClipboard();
    }
  };
  
  // Calcola le statistiche degli inviti
  const completedReferrals = referrals?.filter(r => r.status === 'completed') || [];
  const pendingReferrals = referrals?.filter(r => r.status === 'pending') || [];
  const totalRewards = completedReferrals.length * 5; // 5 crediti per ogni invito completato
  
  // Calcola il progresso verso il bonus di 50 crediti (invita 10 amici)
  const progressPercentage = Math.min(completedReferrals.length / 10 * 100, 100);
  const remainingInvites = Math.max(10 - completedReferrals.length, 0);
  
  return (
    <div className="page-container bg-neutral-50">
      <Header 
        showBackButton={true} 
        title="Invita Amici" 
        backDestination="/profile"
      />
      
      <div className="p-4 pb-24">
        {/* Premio inviti */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Premio Speciale
            </h3>
            <span className="text-sm text-yellow-600 font-medium">
              {completedReferrals.length}/10 inviti
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            Invita 10 amici e ricevi <span className="font-semibold">50 crediti</span> di bonus!
          </p>
          
          {/* Barra di progresso */}
          <div className="h-2 bg-gray-200 rounded-full mb-2">
            <div 
              className="h-full bg-yellow-500 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="text-xs text-gray-500">
            {remainingInvites > 0 
              ? `Ti mancano ${remainingInvites} amici per ottenere il bonus di 50 crediti` 
              : 'Hai completato la sfida! Hai ricevuto 50 crediti bonus'}
          </div>
        </div>
        
        {/* Link di invito */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-primary mb-2">Il tuo link di invito</h3>
          <p className="text-xs text-gray-600 mb-3">
            Condividi questo link con i tuoi amici. Per ogni amico che si registra, riceverai 5 crediti!
          </p>
          
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 rounded-lg p-2 flex-1 text-xs truncate">
              {referralLink}
            </div>
            <button 
              className="p-2 bg-primary text-white rounded-lg"
              onClick={copyToClipboard}
            >
              <Copy className="w-4 h-4" />
            </button>
            <button 
              className="p-2 bg-primary text-white rounded-lg"
              onClick={shareLink}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Statistiche inviti */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-3 shadow-sm text-center">
            <div className="text-xl font-semibold text-primary">{referrals?.length || 0}</div>
            <div className="text-xs text-gray-500">Totale inviti</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm text-center">
            <div className="text-xl font-semibold text-green-600">{completedReferrals.length}</div>
            <div className="text-xs text-gray-500">Completati</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm text-center">
            <div className="text-xl font-semibold text-yellow-600">{totalRewards}</div>
            <div className="text-xs text-gray-500">Crediti guadagnati</div>
          </div>
        </div>
        
        {/* Lista inviti */}
        <h3 className="font-semibold text-primary flex items-center gap-2 mb-3">
          <Users className="w-4 h-4" />
          I tuoi inviti
        </h3>
        
        {isLoading ? (
          // Loading state
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg p-3 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : referrals?.length ? (
          <div className="space-y-3">
            {referrals.map(referral => (
              <div key={referral._id || referral.id} className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">{referral.email}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    referral.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {referral.status === 'completed' ? 'Completato' : 'In attesa'}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Invitato il {formatDate(new Date(referral.createdAt))}
                  {referral.completedAt && (
                    <span> · Registrato il {formatDate(new Date(referral.completedAt))}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Non hai ancora invitato nessun amico. Condividi il tuo link di invito per iniziare!
          </div>
        )}
      </div>
      
      <BottomNavigation activeItem="profile" />
    </div>
  );
}