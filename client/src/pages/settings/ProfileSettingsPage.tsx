import { FC, useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Save } from 'lucide-react';
import { useUpdateUserProfileMutation } from '../../store/api/userApi';

const profileFormSchema = z.object({
  nome: z.string().min(2, { message: 'Il nome deve contenere almeno 2 caratteri' }),
  cognome: z.string().min(2, { message: 'Il cognome deve contenere almeno 2 caratteri' }),
  userName: z.string().min(3, { message: 'Lo username deve contenere almeno 3 caratteri' }),
  email: z.string().email({ message: 'Inserisci un indirizzo email valido' }),
  password: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileSettingsPage: FC = () => {
  const { user, refetchUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [updateUserProfile, {isLoading, isSuccess, isError, error}] = useUpdateUserProfileMutation();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nome: user?.nome || '',
      cognome: user?.cognome || '',
      userName: user?.username || '',
      email: user?.email || '',
      password: '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
   
    try {
      await updateUserProfile(data).unwrap();
      await refetchUser();
      toast({
        title: 'Profilo aggiornato',
        description: 'Le tue informazioni sono state aggiornate con successo.'
      });
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del profilo:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante l\'aggiornamento del profilo.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header showBackButton backDestination="/settings" title="Informazioni Utente" />
      
      <motion.div 
        className="flex-1 p-6 overflow-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center relative overflow-hidden">
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={user.fullName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl font-semibold text-primary">{user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}</span>
              </div>
            )}
            <label htmlFor="profileImage" className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center cursor-pointer transition-all duration-200">
              <div className="opacity-0 hover:opacity-100 transition-opacity">
                <div className="bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center">
                  <i className="ri-camera-line text-sm"></i>
                </div>
              </div>
            </label>
            <input 
              type="file" 
              id="profileImage" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    // In una implementazione reale, qui caricheremmo l'immagine al server
                    // Per ora mostriamo solo un messaggio di successo
                    toast({
                      title: 'Immagine caricata',
                      description: 'La tua immagine del profilo è stata aggiornata con successo.'
                    });
                  };
                  reader.readAsDataURL(e.target.files[0]);
                }
              }} 
            />
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
             <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Inserisci il tuo nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cognome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cognome</FormLabel>
                  <FormControl>
                    <Input placeholder="Inserisci il tuo cognome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Inserisci la tua email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
             <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Inserisci il tuo username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cambia Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="Nuova password (lascia vuoto per non cambiare)" 
                        {...field} 
                      />
                      <button 
                        type="button" 
                        className="absolute right-3 top-2.5 text-gray-400"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full btn-primary">
              <Save className="mr-2 h-4 w-4" />
              Salva Modifiche
            </Button>
          </form>
        </Form>
      </motion.div>
      
      <BottomNavigation />
    </div>
  );
};

export default ProfileSettingsPage;