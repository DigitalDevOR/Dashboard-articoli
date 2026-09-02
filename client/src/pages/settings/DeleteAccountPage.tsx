import React, { useState } from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangle,
  AlertCircle, 
  CheckCircle2, 
  X
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const DeleteAccountPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [confirmation, setConfirmation] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDeleteRequest = () => {
    if (confirmation.toLowerCase() !== 'elimina') {
      toast({
        title: 'Conferma non valida',
        description: 'Per favore, digita "elimina" per confermare la cancellazione del tuo account.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    
    try {
      // Simulazione della chiamata API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsDeleting(false);
      setIsSuccess(true);
      
      // Dopo l'eliminazione con successo
      setTimeout(() => {
        setIsDialogOpen(false);
        setLocation('/auth');
      }, 2000);
      
    } catch (error) {
      setIsDeleting(false);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante la cancellazione dell\'account. Riprova più tardi.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="page-container">
      <Header title="Cancella Account" showBackButton backDestination="/settings" />
      
      <div className="p-4 flex-1 bg-gray-50">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800 mb-1">Operazione irreversibile</h3>
              <p className="text-sm text-red-700">
                Cancellare il tuo account eliminerà permanentemente tutti i tuoi dati,
                pronostici, crediti e premi vinti. Questa operazione non può essere annullata.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Sei sicuro di voler cancellare il tuo account?</h2>
            
            <p className="text-sm text-gray-600">
              Se procedi con l'eliminazione:
            </p>
            
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Perderai l'accesso a tutti i tuoi pronostici passati</li>
              <li>I tuoi crediti e premi non potranno essere recuperati</li>
              <li>La tua posizione nelle classifiche verrà rimossa</li>
              <li>Il tuo codice invito non sarà più valido</li>
            </ul>
            
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Per confermare, digita "elimina" nel campo sottostante:
              </label>
              <Input
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="elimina"
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              variant="destructive" 
              onClick={handleDeleteRequest}
              disabled={confirmation.toLowerCase() !== 'elimina'}
              className="w-full"
            >
              Cancella il mio account
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setLocation('/settings')}
              className="w-full"
            >
              Annulla
            </Button>
          </div>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {isSuccess ? (
            <div className="flex flex-col items-center py-6">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-center">Account cancellato</DialogTitle>
              <DialogDescription className="text-center mt-2">
                Il tuo account è stato cancellato con successo. Grazie per aver usato BetMaster League.
              </DialogDescription>
            </div>
          ) : (
            <>
              <DialogHeader>
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                  <DialogTitle>Conferma cancellazione</DialogTitle>
                </div>
                <DialogDescription>
                  Questa azione è irreversibile. Sei assolutamente sicuro di voler procedere?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center gap-3 mt-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Eliminazione in corso...' : 'Sì, elimina il mio account'}
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    No, torna indietro
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <BottomNavigation activeItem="home" />
    </div>
  );
};

export default DeleteAccountPage;