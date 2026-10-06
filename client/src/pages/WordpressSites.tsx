import { type FormEvent, useState } from "react";
import { Globe, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { PasswordInput } from "../components/ui/password-input";
import type {
    CreateWordpressSiteInput,
    WordpressSite,
} from "../api/wordpressSites.api";
import { useCurrentUser } from "../queries/auth.queries";
import { hasPermission } from "../lib/permissions";
import {
    useCreateWordpressSite,
    useDeleteWordpressSite,
    useUpdateWordpressSite,
    useWordpressSites,
} from "../queries/wordpressSites.queries";

function getErrorMessage(error: unknown) {
    return error instanceof Error
        ? error.message
        : "Si è verificato un errore durante il recupero dei siti.";
}

export default function WordpressSites() {
    const sitesQuery = useWordpressSites();
    const createSiteMutation = useCreateWordpressSite();
    const updateSiteMutation = useUpdateWordpressSite();
    const deleteSiteMutation = useDeleteWordpressSite();
    const [editingSite, setEditingSite] = useState<WordpressSite | null>(null);
    const currentUserQuery = useCurrentUser();
    const canCreate = hasPermission(currentUserQuery.data, "site:create");
    const canUpdate = hasPermission(currentUserQuery.data, "site:update");
    const canDelete = hasPermission(currentUserQuery.data, "site:delete");

    if (currentUserQuery.isPending) {
        return <p className="text-sm text-muted-foreground">Verifica autorizzazioni siti...</p>;
    }

    if (!hasPermission(currentUserQuery.data, "site:read")) {
        return <p className="text-sm text-destructive" role="alert">Non sei autorizzato a leggere i siti.</p>;
    }

    const saveMutation = editingSite?._id ? updateSiteMutation : createSiteMutation;

    function resetForm() {
        setEditingSite(null);
        createSiteMutation.reset();
        updateSiteMutation.reset();
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const input: CreateWordpressSiteInput = {
            name: String(formData.get("name") ?? ""),
            wpUrl: String(formData.get("wpUrl") ?? ""),
            username: String(formData.get("username") ?? ""),
            appPasswordEncrypted: String(formData.get("appPasswordEncrypted") ?? ""),
            enabled: formData.get("enabled") === "on",
        };

        if (editingSite?._id) {
            const { appPasswordEncrypted, ...siteInput } = input;
            updateSiteMutation.mutate(
                {
                    siteId: editingSite._id,
                    input: appPasswordEncrypted ? input : siteInput,
                },
                { onSuccess: resetForm },
            );
            return;
        }

        createSiteMutation.mutate(input, { onSuccess: resetForm });
    }

    function handleDelete(siteId: string, siteName: string) {
        if (window.confirm(`Vuoi eliminare il sito "${siteName}"?`)) {
            deleteSiteMutation.mutate(siteId);
        }
    }

    return (
        <section className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-primary">
                        <Globe className="h-5 w-5" />
                        <span className="text-sm font-medium">Configurazione</span>
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight">Siti WordPress</h2>
                    <p className="text-muted-foreground">
                        Gestisci i siti collegati alla piattaforma.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={() => sitesQuery.refetch()}
                        disabled={sitesQuery.isFetching}
                    >
                        <RefreshCw className={`h-4 w-4 ${sitesQuery.isFetching ? "animate-spin" : ""}`} />
                        Aggiorna
                    </Button>
                    {canCreate && <Button type="button" className="gap-2" onClick={() => setEditingSite({
                        _id: "",
                        name: "",
                        wpUrl: "",
                        username: "",
                        enabled: true,
                    })}>
                        <Plus className="h-4 w-4" />
                        Nuovo sito
                    </Button>}
                </div>
            </div>

            {editingSite && (
                <form className="space-y-5 rounded-lg border bg-card p-6" onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">
                                {editingSite._id ? "Modifica sito" : "Nuovo sito WordPress"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Inserisci i dati per collegare il sito WordPress.
                            </p>
                        </div>
                        <Button type="button" variant="ghost" aria-label="Chiudi form" onClick={resetForm}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input id="name" name="name" defaultValue={editingSite.name} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="wpUrl">URL WordPress</Label>
                            <Input id="wpUrl" name="wpUrl" type="url" defaultValue={editingSite.wpUrl} placeholder="https://esempio.it" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username API</Label>
                            <Input id="username" name="username" defaultValue={editingSite.username} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="appPasswordEncrypted">
                                Application password {editingSite._id && "(opzionale)"}
                            </Label>
                            <PasswordInput
                                id="appPasswordEncrypted"
                                name="appPasswordEncrypted"
                                placeholder={editingSite._id ? "Lascia vuoto per non modificarla" : "Inserisci la password"}
                                required={!editingSite._id}
                            />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="enabled" defaultChecked={editingSite.enabled} />
                        Sito attivo
                    </label>
                    {saveMutation.isError && (
                        <p className="text-sm text-destructive" role="alert">
                            {getErrorMessage(saveMutation.error)}
                        </p>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={resetForm}>Annulla</Button>
                        <Button type="submit" disabled={saveMutation.isPending}>
                            {saveMutation.isPending ? "Salvataggio..." : "Salva sito"}
                        </Button>
                    </div>
                </form>
            )}

            {sitesQuery.isPending && (
                <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
                    Caricamento siti WordPress...
                </div>
            )}

            {sitesQuery.isError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
                    {getErrorMessage(sitesQuery.error)}
                </div>
            )}

            {deleteSiteMutation.isError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
                    {getErrorMessage(deleteSiteMutation.error)}
                </div>
            )}

            {sitesQuery.isSuccess && sitesQuery.data.length === 0 && (
                <div className="rounded-lg border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
                    Nessun sito WordPress configurato.
                </div>
            )}

            {sitesQuery.isSuccess && sitesQuery.data.length > 0 && (
                <div className="overflow-hidden rounded-lg border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead className="border-b bg-muted/40 text-left">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Nome</th>
                                    <th className="px-5 py-3 font-medium">URL</th>
                                    <th className="px-5 py-3 font-medium">Username</th>
                                    <th className="px-5 py-3 font-medium">Stato</th>
                                    <th className="px-5 py-3 text-right font-medium">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {sitesQuery.data.map((site) => (
                                    <tr key={site._id}>
                                        <td className="px-5 py-4 font-medium">{site.name}</td>
                                        <td className="px-5 py-4 text-muted-foreground">{site.wpUrl}</td>
                                        <td className="px-5 py-4 text-muted-foreground">{site.username}</td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    site.enabled
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-muted text-muted-foreground"
                                                }`}
                                            >
                                                {site.enabled ? "Attivo" : "Disattivato"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {canUpdate && <Button
                                                type="button"
                                                variant="ghost"
                                                className="mr-1 gap-2"
                                                onClick={() => setEditingSite(site)}
                                                disabled={deleteSiteMutation.isPending}
                                            >
                                                <Pencil className="h-4 w-4" />
                                                Modifica
                                            </Button>}
                                            {canDelete && <Button
                                                type="button"
                                                variant="ghost"
                                                className="gap-2 text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(site._id, site.name)}
                                                disabled={deleteSiteMutation.isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Elimina
                                            </Button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    );
}
