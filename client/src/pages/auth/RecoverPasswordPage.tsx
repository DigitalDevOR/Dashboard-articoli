import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/Header';

const recoverSchema = z.object({
  email: z.string().email("Inserisci un'email valida"),
});

type RecoverFormValues = z.infer<typeof recoverSchema>;

export default function RecoverPasswordPage() {
  const [, setLocation] = useLocation();
  const { recoverPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RecoverFormValues>({
    resolver: zodResolver(recoverSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: RecoverFormValues) => {
    setIsLoading(true);
    try {
      await recoverPassword(data.email);
      // After successful recovery request, redirect to login
      setTimeout(() => {
        setLocation('/');
      }, 2000);
    } catch (error) {
      // Error is handled in useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header 
        showBackButton={true} 
        backDestination="/"
      />
      
      <div className="flex-1 p-6">
        <h1 className="text-xl font-semibold text-primary mb-4">
          Recupera la<br />tua password
        </h1>
        
        <p className="text-xs text-gray-500 mb-6">
          Inserisci la tua mail per iniziare la procedura di recupero password
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="Email" 
                      type="email"
                      className="form-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-destructive text-sm" />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="btn-primary w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Invio in corso...' : 'Invia'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
