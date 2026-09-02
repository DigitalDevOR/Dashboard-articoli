import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

// Schema di validazione
const recoverSchema = z.object({
  email: z.string().email({ message: 'Email non valida' }),
});

type RecoverData = z.infer<typeof recoverSchema>;

export default function RecoverPasswordPage() {
  const [, setLocation] = useLocation();
  const { recoverPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<RecoverData>({
    resolver: zodResolver(recoverSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: RecoverData) {
    setIsSubmitting(true);
    try {
      await recoverPassword(data.email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Recover password error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-container bg-neutral-50">
      <Header 
        showLogo={false} 
        showBackButton={true}
        backDestination="/auth/login"
        title="Recupera Password" 
        showNotification={false}
      />
      
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recupera la tua password</CardTitle>
            <CardDescription>
              Inserisci la tua email per ricevere un link di reset della password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="text-center py-6">
                <div className="mb-4 bg-green-50 p-3 rounded-md text-green-800">
                  <p>Abbiamo inviato un'email all'indirizzo fornito.</p>
                  <p className="text-sm mt-2">
                    Se l'indirizzo esiste nel nostro sistema, riceverai a breve le istruzioni per reimpostare la password.
                  </p>
                </div>
                <Button onClick={() => setLocation('/auth/login')} className="mt-4">
                  Torna al login
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="La tua email" 
                            type="email" 
                            autoComplete="email" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Invio in corso...
                      </>
                    ) : "Invia email di recupero"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <Button 
              variant="link" 
              onClick={() => setLocation('/auth/login')}
              disabled={isSubmitting}
            >
              Torna al login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}