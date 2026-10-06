import { type FormEvent } from "react";
import { KeyRound, UserRound } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { PasswordInput } from "../components/ui/password-input";
import {
    useCurrentUser,
    useUpdateProfileEmail,
    useUpdateProfilePassword,
} from "../queries/auth.queries";

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Operazione non riuscita.";
}

export default function Profile() {
    const userQuery = useCurrentUser();
    const emailMutation = useUpdateProfileEmail();
    const passwordMutation = useUpdateProfilePassword();

    function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        emailMutation.mutate(String(formData.get("email") ?? ""));
    }

    function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        passwordMutation.mutate({
            oldPassword: String(formData.get("oldPassword") ?? ""),
            password: String(formData.get("password") ?? ""),
        });
        event.currentTarget.reset();
    }

    if (userQuery.isPending) {
        return <p className="text-sm text-muted-foreground">Caricamento profilo...</p>;
    }

    if (userQuery.isError || !userQuery.data) {
        return <p className="text-sm text-destructive" role="alert">{getErrorMessage(userQuery.error)}</p>;
    }

    const user = userQuery.data;

    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Gestione profilo utente</h2>
                <p className="text-muted-foreground">Aggiorna i dati del tuo account.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <UserRound className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">Informazioni account</CardTitle>
                        </div>
                        <CardDescription>Profilo autenticato attualmente in uso.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <p><span className="font-medium">Nome:</span> {user.nome} {user.cognome}</p>
                        <p><span className="font-medium">Email:</span> {user.email}</p>
                        <p><span className="font-medium">Ruolo:</span> {user.isSuperAdmin ? "Amministratore" : "Utente"}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Aggiorna email</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={handleEmailSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="email">Nuova email</Label>
                                <Input id="email" name="email" type="email" defaultValue={user.email} required />
                            </div>
                            {emailMutation.isError && <p className="text-sm text-destructive">{getErrorMessage(emailMutation.error)}</p>}
                            {emailMutation.isSuccess && <p className="text-sm text-emerald-700">Email aggiornata.</p>}
                            <Button type="submit" disabled={emailMutation.isPending}>
                                {emailMutation.isPending ? "Aggiornamento..." : "Aggiorna email"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">Aggiorna password</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="oldPassword">Password attuale</Label>
                                <PasswordInput id="oldPassword" name="oldPassword" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Nuova password</Label>
                                <PasswordInput id="password" name="password" minLength={8} required />
                            </div>
                            {passwordMutation.isError && <p className="text-sm text-destructive">{getErrorMessage(passwordMutation.error)}</p>}
                            {passwordMutation.isSuccess && <p className="text-sm text-emerald-700">Password aggiornata.</p>}
                            <Button type="submit" disabled={passwordMutation.isPending}>
                                {passwordMutation.isPending ? "Aggiornamento..." : "Aggiorna password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}