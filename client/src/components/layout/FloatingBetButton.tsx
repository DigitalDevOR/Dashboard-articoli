import { useSchedineStore } from '@/store/useSchedineStore';
import { Button } from '@/components/ui/button';
import { ReceiptText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function FloatingBetButton() {
  const { openSchedina, bets } = useSchedineStore();
  const { user } = useAuth();
  
  // Se l'utente non è loggato, non mostrare il pulsante
  if (!user) return null;
  
  return (
    <div className="fixed bottom-20 right-4 z-30 md:hidden">
      <Button
        onClick={openSchedina}
        className="rounded-full w-14 h-14 bg-blue-700 hover:bg-blue-800 shadow-lg"
      >
        <ReceiptText className="h-6 w-6" />
        {bets.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
            {bets.length}
          </span>
        )}
      </Button>
    </div>
  );
}