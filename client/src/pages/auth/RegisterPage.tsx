import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import Header from '@/components/layout/Header';
import Logo from '@/components/common/Logo';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z.object({
  firstName: z.string().min(2, "Inserisci il tuo nome"),
  lastName: z.string().min(2, "Inserisci il tuo cognome"),
  email: z.string().email("Inserisci un'email valida"),
  userName: z.string().min(3, "Username troppo corto").max(20, "Username troppo lungo"),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Devi accettare i termini e la privacy",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { register, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      userName: "",
      password: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const result = await register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        userName: data.userName,
        password: data.password,
      });

      console.log("Registrazione riuscita:", result);
      // Reindirizzamento alla home page dopo la registrazione
      localStorage.setItem('isLoggedIn', 'true'); // Assicuriamo persistenza
      localStorage.setItem('justRegistered', 'true'); // Flag per mostrare messaggio di benvenuto


      const loginResult = await login(data.email, data.password);
      console.log("Login riuscito:", loginResult);

      toast({
        title: 'Registrazione completata',
        description: `sei stato autenticato`
      });

      setTimeout(() => {
        setLocation('/send-invite-code');
      }, 1000);

    } catch (error) {
      // Error is handled in useAuth hook
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
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

        <h1 className="mb-8 text-xl font-semibold text-center text-primary">Crea il tuo account</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md mx-auto space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Nome"
                      className="form-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Cognome"
                      className="form-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Inserisci la tua mail"
                      type="email"
                      className="form-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="UserName"
                      className="form-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Password"
                        type={showPassword ? "text" : "password"}
                        className="pr-10 form-input"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute text-gray-400 right-3 top-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-sm text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="text-xs text-gray-600">
                    Ho letto e accetto i{' '}
                    <a
                      href="#"
                      className="text-blue-500"
                      onClick={(e) => {
                        e.preventDefault();
                        setLocation('/support/terms');
                      }}
                    >
                      Termini
                    </a> e la{' '}
                    <a
                      href="#"
                      className="text-blue-500"
                      onClick={(e) => {
                        e.preventDefault();
                        setLocation('/support/privacy');
                      }}
                    >
                      Privacy
                    </a>
                  </div>
                </FormItem>
              )}
            />
            <FormMessage className="text-sm text-destructive">
              {form.formState.errors.acceptTerms?.message}
            </FormMessage>

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Registrazione...' : 'Registrati'}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-sm text-center">
          <span className="text-gray-600">Hai già un account?</span>
          <a
            href="#"
            className="ml-1 text-blue-500"
            onClick={(e) => {
              e.preventDefault();
              setLocation('/login');
            }}
          >
            Accedi
          </a>
        </div>
      </div>
    </motion.div>
  );
}
