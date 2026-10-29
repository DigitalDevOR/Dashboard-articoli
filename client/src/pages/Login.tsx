import { type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { PasswordInput } from "../components/ui/password-input";
import { useLogin } from "../queries/auth.queries";

export default function Login() {
	const [, setLocation] = useLocation();
	const loginMutation = useLogin();

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);

		loginMutation.mutate(
			{
				email: String(formData.get("email") ?? ""),
				password: String(formData.get("password") ?? ""),
			},
			{
				onSuccess: () => setLocation("/upload-articoli"),
			},
		);
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
			<div className="grid w-full max-w-4xl overflow-hidden rounded-xl border bg-card shadow-sm lg:grid-cols-[1fr_1.1fr]">
				<section className="hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
					<div className="flex items-center gap-2 font-semibold">
						<FileText className="h-5 w-5" />
						Dashboard articoli
					</div>
					<div>
						<p className="mb-3 text-sm text-primary-foreground/70">Gestione Articoli</p>
						<h1 className="max-w-xs text-3xl font-semibold leading-tight">
							Visualizza, modifica e pubblica gli articoli sincronizzati con Wordpress.
						</h1>
					</div>
				</section>

				<Card className="rounded-none border-0 shadow-none">
					<CardHeader className="space-y-2 p-8 pb-4">
						<CardTitle>Accedi</CardTitle>
						<CardDescription>Inserisci le tue credenziali per continuare.</CardDescription>
					</CardHeader>
					<CardContent className="p-8 pt-4">
						<form className="space-y-5" onSubmit={handleSubmit}>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input id="email" name="email" type="email" placeholder="nome@azienda.it" autoComplete="email" required />
							</div>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="password">Password</Label>
									{
										/*
										<button type="button" className="text-xs font-medium text-primary hover:underline">
											Password dimenticata?
										</button>
										*/
									}
								</div>
								<PasswordInput id="password" name="password" placeholder="Inserisci la password" required />
							</div>
							<Button className="w-full gap-2" type="submit" disabled={loginMutation.isPending}>
								{loginMutation.isPending ? "Accesso in corso..." : "Accedi"}
								{!loginMutation.isPending && <ArrowRight className="h-4 w-4" />}
							</Button>
						</form>
						{
							/*
							<p className="mt-6 text-center text-sm text-muted-foreground">
								Non hai ancora un account? <Link href="/" className="font-medium text-primary hover:underline">Contatta l&apos;amministratore</Link>
							</p>
							*/
						}
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
