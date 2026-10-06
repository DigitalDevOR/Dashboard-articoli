import { type FormEvent, useState } from "react";
import { Pencil, Trash2, UserPlus, Users as UsersIcon, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { PasswordInput } from "../components/ui/password-input";
import type { User } from "../api/users.api";
import { useCurrentUser } from "../queries/auth.queries";
import { useWordpressSites } from "../queries/wordpressSites.queries";
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "../queries/users.queries";
import { hasPermission, isSuperAdmin } from "../lib/permissions";

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Operazione non riuscita.";
}

function getReferenceId(reference: unknown) {
    if (typeof reference === "string") return reference;
    if (reference && typeof reference === "object" && "_id" in reference) return String(reference._id);
    return "";
}

function getSiteName(user: User) {
    const site = user.siteAccess?.siteId;
    return site && typeof site === "object" ? site.name : site ?? "Nessun sito";
}

function getRoleName(user: User) {
    const role = user.siteAccess?.role;
    return role && typeof role === "object" ? role.roleName : role ?? "Nessun ruolo";
}

export default function Users() {
    const usersQuery = useUsers();
    const currentUserQuery = useCurrentUser();
    const superAdmin = isSuperAdmin(currentUserQuery.data);
    const canReadUsers = hasPermission(currentUserQuery.data, "user:read");
    const canCreateUsers = hasPermission(currentUserQuery.data, "user:create");
    const canUpdateUsers = hasPermission(currentUserQuery.data, "user:update");
    const canDeleteUsers = hasPermission(currentUserQuery.data, "user:delete");
    const sitesQuery = useWordpressSites(superAdmin);
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const deleteUserMutation = useDeleteUser();
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [siteId, setSiteId] = useState("");
    const [role, setRole] = useState<"Admin" | "Editor">("Editor");

    const managedSite = currentUserQuery.data?.siteAccess?.siteId;
    const availableSites = superAdmin
        ? sitesQuery.data ?? []
        : managedSite && typeof managedSite === "object" ? [managedSite] : [];
    const saveMutation = editingUser?._id ? updateUserMutation : createUserMutation;

    if (currentUserQuery.isPending) {
        return <p className="text-sm text-muted-foreground">Verifica autorizzazioni utenti...</p>;
    }

    if (!canReadUsers) {
        return <p className="text-sm text-destructive" role="alert">Non sei autorizzato a gestire gli utenti.</p>;
    }

    function openCreateForm() {
        setEditingUser({ _id: "", nome: "", cognome: "", email: "", isSuperAdmin: false, isActive: true });
        setSiteId(availableSites[0]?._id ?? "");
        setRole("Editor");
        createUserMutation.reset();
        updateUserMutation.reset();
    }

    function openEditForm(user: User) {
        setEditingUser(user);
        setSiteId(getReferenceId(user.siteAccess?.siteId));
        setRole(getRoleName(user) === "Admin" ? "Admin" : "Editor");
        createUserMutation.reset();
        updateUserMutation.reset();
    }

    function closeForm() {
        setEditingUser(null);
        setSiteId("");
        setRole("Editor");
        createUserMutation.reset();
        updateUserMutation.reset();
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!editingUser) return;
        const formData = new FormData(event.currentTarget);
        const password = String(formData.get("password") ?? "");
        const siteAccess = siteId ? { siteId, role } : undefined;
        const commonInput = {
            nome: String(formData.get("nome") ?? "").trim(),
            cognome: String(formData.get("cognome") ?? "").trim(),
            email: String(formData.get("email") ?? "").trim(),
            isActive: formData.get("isActive") === "on",
            siteAccess,
        };

        if (editingUser._id) {
            updateUserMutation.mutate({ userId: editingUser._id, ...commonInput, ...(password ? { password } : {}) }, { onSuccess: closeForm });
        } else {
            createUserMutation.mutate({ ...commonInput, password }, { onSuccess: closeForm });
        }
    }

    function handleDelete(user: User) {
        if (window.confirm(`Vuoi eliminare l'utente "${user.nome} ${user.cognome}"?`)) deleteUserMutation.mutate(user._id);
    }

    return (
        <section className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-primary"><UsersIcon className="h-5 w-5" /><span className="text-sm font-medium">Amministrazione</span></div>
                    <h2 className="text-2xl font-semibold tracking-tight">Gestione utenti</h2>
                    <p className="text-muted-foreground">Ogni utente ha un solo sito e un solo ruolo.</p>
                </div>
                {canCreateUsers && <Button type="button" className="gap-2" onClick={openCreateForm}><UserPlus className="h-4 w-4" />Nuovo utente</Button>}
            </div>

            {editingUser && (
                <form className="space-y-5 rounded-lg border bg-card p-6" onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between"><div><h3 className="text-lg font-semibold">{editingUser._id ? "Modifica utente" : "Nuovo utente"}</h3><p className="text-sm text-muted-foreground">Configura dati personali, sito e ruolo.</p></div><Button type="button" variant="ghost" aria-label="Chiudi form" onClick={closeForm}><X className="h-4 w-4" /></Button></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2"><Label htmlFor="nome">Nome</Label><Input id="nome" name="nome" defaultValue={editingUser.nome} required /></div>
                        <div className="space-y-2"><Label htmlFor="cognome">Cognome</Label><Input id="cognome" name="cognome" defaultValue={editingUser.cognome} required /></div>
                        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" defaultValue={editingUser.email} required /></div>
                        <div className="space-y-2"><Label htmlFor="password">{editingUser._id ? "Nuova password (opzionale)" : "Password"}</Label><PasswordInput id="password" name="password" minLength={8} required={!editingUser._id} /></div>
                        <div className="space-y-2"><Label htmlFor="siteId">Sito</Label><select id="siteId" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={siteId} onChange={(event) => setSiteId(event.target.value)} required>{availableSites.map((site) => <option key={site._id} value={site._id}>{site.name}</option>)}</select></div>
                        <div className="space-y-2"><Label htmlFor="role">Ruolo</Label><select id="role" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={role} disabled={!superAdmin} onChange={(event) => setRole(event.target.value as "Admin" | "Editor")}><option value="Editor">Editor</option>{superAdmin && <option value="Admin">Admin</option>}</select></div>
                    </div>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={editingUser.isActive} />Utente attivo</label>
                    {saveMutation.isError && <p className="text-sm text-destructive" role="alert">{getErrorMessage(saveMutation.error)}</p>}
                    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={closeForm}>Annulla</Button><Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Salvataggio..." : "Salva utente"}</Button></div>
                </form>
            )}

            {(usersQuery.isPending || (isSuperAdmin && sitesQuery.isPending)) && <p className="text-sm text-muted-foreground">Caricamento utenti...</p>}
            {(usersQuery.isError || (isSuperAdmin && sitesQuery.isError)) && <p className="text-sm text-destructive" role="alert">{getErrorMessage(usersQuery.error ?? sitesQuery.error)}</p>}
            {deleteUserMutation.isError && <p className="text-sm text-destructive" role="alert">{getErrorMessage(deleteUserMutation.error)}</p>}
            {usersQuery.isSuccess && usersQuery.data.length === 0 && <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Nessun Editor trovato.</p>}
            {usersQuery.isSuccess && usersQuery.data.length > 0 && <div className="overflow-hidden rounded-lg border bg-card"><div className="overflow-x-auto"><table className="w-full min-w-[780px] text-sm"><thead className="border-b bg-muted/40 text-left"><tr><th className="px-5 py-3 font-medium">Utente</th><th className="px-5 py-3 font-medium">Ruolo</th><th className="px-5 py-3 font-medium">Sito</th><th className="px-5 py-3 font-medium">Stato</th><th className="px-5 py-3 text-right font-medium">Azioni</th></tr></thead><tbody className="divide-y">{usersQuery.data.map((user) => <tr key={user._id}><td className="px-5 py-4"><p className="font-medium">{user.nome} {user.cognome}</p><p className="text-muted-foreground">{user.email}</p></td><td className="px-5 py-4">{user.isSuperAdmin ? "Super admin" : getRoleName(user)}</td><td className="px-5 py-4 text-muted-foreground">{getSiteName(user)}</td><td className="px-5 py-4"><span className={user.isActive ? "text-emerald-700" : "text-muted-foreground"}>{user.isActive ? "Attivo" : "Disattivato"}</span></td><td className="px-5 py-4 text-right">{canUpdateUsers && <Button type="button" variant="ghost" className="mr-1 gap-2" onClick={() => openEditForm(user)}><Pencil className="h-4 w-4" />Modifica</Button>}{canDeleteUsers && <Button type="button" variant="ghost" className="gap-2 text-destructive hover:text-destructive" onClick={() => handleDelete(user)} disabled={deleteUserMutation.isPending}><Trash2 className="h-4 w-4" />Elimina</Button>}</td></tr>)}</tbody></table></div></div>}
        </section>
    );
}
