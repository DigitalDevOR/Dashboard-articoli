import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useResetUserPasswordMutation } from "../../store/api/userApi";
import { set, z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function ResetPasswordPage() {
  const [resetUserPassword, { isLoading, isSuccess, isError, error }] =
    useResetUserPasswordMutation();
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  const resetSchema = z
    .object({
      newPassword: z
        .string()
        .min(6, "La password deve essere di almeno 6 caratteri"),
      confermaPassword: z
        .string()
        .min(6, "La conferma deve essere di almeno 6 caratteri"),
    })
    .refine((data) => data.newPassword === data.confermaPassword, {
      message: "Le password non coincidono",
      path: ["confermaPassword"],
    });

  type resetFormValues = z.infer<typeof resetSchema>;

  const form = useForm<resetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  const onSubmit = async (data: resetFormValues) => {
    try {
      if (!token) {
        throw new Error("Token non valido");
      }
      await resetUserPassword({
        newPassword: data.newPassword,
        token: token,
      }).unwrap();
      toast({
        title: "Password aggiornata",
        description: "La tua password è stata aggiornata con successo.",
        variant: "success",
      });
      // Redirect to login or home page after successful reset
      setTimeout(() => {
        window.location.href = "/login"; // Adjust the redirect as needed
      }, 2000);
    } catch (error) {
      toast({
        title: "Errore",
        description:
          "Si è verificato un errore durante il reset della password.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col w-full relative overflow-hidden">
      <div className="page-container bg-neutral-50">
        <Header showBackButton={true} backDestination="/" />
        <div className="p-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="font-semibold tracking-tight text-xl">
                Imposta una nuova password
              </div>
              <div className="text-sm text-muted-foreground">
                Inserisci una nuova password per il tuo account. Assicurati che
                sia sicura e facile da ricordare.
              </div>
            </div>

            <div className="flex flex-col overflow-hidden">
              <div className="flex-1 p-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full  space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Nuova Password"
                                type={showPassword ? "text" : "password"}
                                className="form-input pr-10"
                                name="newPassword"
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

                    <FormField
                      control={form.control}
                      name="confermaPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Conferma Password"
                                type={showConfirmPassword ? "text" : "password"}
                                className="form-input pr-10"
                                {...field}
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-3 text-gray-400"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              >
                                {showConfirmPassword ? (
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
                      {isLoading ? "Salvataggio in corso..." : "Salva"}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
