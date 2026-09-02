import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStatus } from "../../hooks/useAuthStatus";

const loginSchema = z.object({
  email: z.string().email("La mail inserita non è corretta"),
  password: z.string().min(6, "La password inserita non è corretta"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuthStatus();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/"; // Redirect to home if already authenticated
    }
  }, [isAuthenticated]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);

      // Persistenza dati di autenticazione
      localStorage.setItem("isLoggedIn", "true");
      console.log("Login completato, reindirizzamento alla home...");

      // Redirect alla home page dopo un login di successo
      // Reindirizzamento più affidabile con reload completo
      setTimeout(() => {
        window.location.href = "/"; // Forza un reload completo
      }, 800);
    } catch (error) {
      // Error is handled in useAuth hook
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen p-6 bg-white w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 w-full max-w-[250px]">
        <Logo size="large" showFullLogo={true} />
      </div>

      <h1 className="text-2xl font-bold text-primary mb-8">Benvenuto</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-md mx-auto space-y-4"
        >
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
                      className="form-input pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOffIcon size={18} />
                      ) : (
                        <EyeIcon size={18} />
                      )}
                    </button>
                  </div>
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
            {isLoading ? "Caricamento..." : "Accedi"}
          </Button>
        </form>
      </Form>

      <div className="text-sm text-center mt-4">
        <a
          href="#"
          className="text-blue-500"
          onClick={(e) => {
            e.preventDefault();
            setLocation("/recover-password");
          }}
        >
          Recupera password
        </a>
      </div>

      <div className="text-sm text-center mt-4">
        <span className="text-gray-600">Non hai un account?</span>
        <a
          href="#"
          className="text-blue-500 ml-1"
          onClick={(e) => {
            e.preventDefault();
            setLocation("/register");
          }}
        >
          Registrati
        </a>
      </div>

      <div className="mt-8 text-center">
        <a
          href="#"
          className="text-xs text-gray-500"
          onClick={(e) => {
            e.preventDefault();
            setLocation("/guida-pubblica");
          }}
        >
          Come funziona? <span className="underline">Guida Rapida</span>
        </a>
      </div>
    </motion.div>
  );
}
