import { FC, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogOut } from 'lucide-react';

const LogoutPage: FC = () => {
  const [, navigate] = useLocation();
  const { logout } = useAuth();
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout effettuato",
        description: "Hai effettuato il logout con successo.",
      });
      navigate('/', { replace: true });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il logout. Riprova più tardi.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Header title="Logout" showBackButton={true} backDestination="/settings" />

      <motion.div
        className="flex-1 p-6 flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogOut className="h-10 w-10 text-destructive" />
          </div>
          
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Vuoi uscire?</h1>
          <p className="text-gray-600 mb-8">
            Stai per effettuare il logout da Bet Master League. Continuerai a navigare come ospite.
          </p>

          <div className="flex flex-col space-y-3">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowConfirmDialog(true)}
            >
              Conferma logout
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/settings')}
            >
              Annulla
            </Button>
          </div>
        </div>
      </motion.div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confermi di voler uscire?</AlertDialogTitle>
            <AlertDialogDescription>
              Se confermi il logout, dovrai effettuare nuovamente l'accesso per utilizzare tutte le funzionalità del tuo account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sì, esci
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LogoutPage;