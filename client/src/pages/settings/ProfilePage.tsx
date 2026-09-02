import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Schema di validazione
const profileSchema = z.object({
  fullName: z.string().min(3, 'Il nome completo deve avere almeno 3 caratteri'),
  username: z.string().min(3, 'Il nome utente deve avere almeno 3 caratteri'),
  email: z.string().email('Inserisci un indirizzo email valido'),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulazione di aggiornamento profilo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Profilo aggiornato',
        description: 'Le informazioni del tuo profilo sono state aggiornate con successo.',
        variant: 'success',
      });
      
      setLocation('/settings');
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante l\'aggiornamento del profilo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <Header title="Modifica Profilo" showBackButton backDestination="/settings" />
      
      <div className="p-4 flex-1 bg-gray-50">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni personali</CardTitle>
                <CardDescription>
                  Aggiorna le tue informazioni personali
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Mario Rossi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome utente</FormLabel>
                      <FormControl>
                        <Input placeholder="mario.rossi" {...field} />
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
                        <Input placeholder="mario.rossi@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono (opzionale)</FormLabel>
                      <FormControl>
                        <Input placeholder="+39 123 456 7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/settings')}
                  type="button"
                >
                  Annulla
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-secondary text-primary hover:bg-secondary/90"
                >
                  {isSubmitting ? 'Salvataggio...' : 'Salva modifiche'}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Modifica la tua password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Password attuale</Label>
                    <Input type="password" id="current-password" placeholder="••••••••" />
                  </div>
                  <div>
                    <Label htmlFor="new-password">Nuova password</Label>
                    <Input type="password" id="new-password" placeholder="••••••••" />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Conferma password</Label>
                    <Input type="password" id="confirm-password" placeholder="••••••••" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-secondary text-primary hover:bg-secondary/90"
                  type="button"
                  onClick={() => {
                    toast({
                      title: 'Funzionalità non disponibile',
                      description: 'La modifica della password non è attualmente disponibile.',
                      variant: 'default',
                    });
                  }}
                >
                  Cambia password
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
      
      <BottomNavigation activeItem="home" />
    </div>
  );
};

export default ProfilePage;