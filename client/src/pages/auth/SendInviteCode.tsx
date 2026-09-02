import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { set, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/Header';
import Logo from '@/components/common/Logo';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useSendInviteCodeMutation } from '../../store/api/userApi';

const inviteCodeSchema = z.object({
  inviteCode: z.string().min(6, "Il codice invito deve essere di almeno 6 caratteri"),
});

type InviteCodeFormValues = z.infer<typeof inviteCodeSchema>;

export default function SendInviteCode() {
  const [, setLocation] = useLocation();
  const [sendInviteCode, { isLoading }] = useSendInviteCodeMutation();
  const { toast } = useToast();

  const form = useForm<InviteCodeFormValues>({
    resolver: zodResolver(inviteCodeSchema),
    defaultValues: {
      inviteCode: "",
    },
  });

  const onSubmit = async (data: InviteCodeFormValues) => {
    try {
      await sendInviteCode({ inviteCode: data.inviteCode }).unwrap();
      toast({
        title: 'Codice invito inviato con successo!',
      });
      form.reset(); // Resetta il campo dopo il successo
      setLocation('/'); // Reindirizza alla home page
    } catch (error) {
      console.error('Errore durante l\'invio del codice invito:', error);
      toast({
        title: 'Errore',
        description: 'Non è stato possibile inviare il codice invito. Riprova.',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div
      className="flex flex-col w-full min-h-screen bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header
        showBackButton={true}
        showLogo={false}
        backDestination="/"
      />

      <div className="flex-1 w-full p-6">
        <div className="flex justify-center w-full mb-6">
          <div className="w-full max-w-[250px]">
            <Logo size="large" showFullLogo={true} />
          </div>
        </div>

        <h1 className="mb-8 text-xl font-semibold text-center text-primary">Inserisci il Codice Invito</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md mx-auto space-y-4">
            <FormField
              control={form.control}
              name="inviteCode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Codice Invito"
                      className="form-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-destructive" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Invio...' : 'Invia Codice'}
            </Button>
            <Button
                variant="secondary"
                className="w-full"
                onClick={() => setLocation('/')}
            >
                Non mi interessa
          </Button>
          </form>
        </Form>
      </div>
    </motion.div>
  );
}