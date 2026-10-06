import { useEffect, useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import type { Permission } from "../api/permissions.api";
import type { Role } from "../api/roles.api";
import { usePermissions } from "../queries/permissions.queries";
import { useCurrentUser } from "../queries/auth.queries";
import { hasPermission } from "../lib/permissions";
import {
    useAddPermissionsToRole,
    useRemovePermissionsFromRole,
    useRoles,
} from "../queries/roles.queries";

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Impossibile recuperare ruoli e permessi.";
}

function getPermissionId(permission: string | Permission) {
    return typeof permission === "string" ? permission : permission._id;
}

function getPermissionLabel(permission: string | Permission) {
    return typeof permission === "string" ? permission : permission.label;
}

export default function Roles() {
    const rolesQuery = useRoles();
    const permissionsQuery = usePermissions();
    const currentUserQuery = useCurrentUser();
    const addPermissionsMutation = useAddPermissionsToRole();
    const removePermissionsMutation = useRemovePermissionsFromRole();
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
    const error = rolesQuery.error ?? permissionsQuery.error;
    const isSaving = addPermissionsMutation.isPending || removePermissionsMutation.isPending;
    const canAssignPermissions = hasPermission(currentUserQuery.data, "permission:assign");

    useEffect(() => {
        if (!selectedRole) {
            return;
        }

        const refreshedRole = rolesQuery.data?.find((role) => role._id === selectedRole._id);
        if (refreshedRole) {
            setSelectedRole(refreshedRole);
            setSelectedPermissionIds(refreshedRole.permissions.map(getPermissionId));
        }
    }, [rolesQuery.data, selectedRole?._id]);

    if (currentUserQuery.isPending) {
        return <p className="text-sm text-muted-foreground">Verifica autorizzazioni ruoli...</p>;
    }

    if (!canAssignPermissions) {
        return <p className="text-sm text-destructive" role="alert">Non sei autorizzato a gestire ruoli e permessi.</p>;
    }

    function openPermissionEditor(role: Role) {
        setSelectedRole(role);
        setSelectedPermissionIds(role.permissions.map(getPermissionId));
        addPermissionsMutation.reset();
        removePermissionsMutation.reset();
    }

    function togglePermission(permissionId: string) {
        setSelectedPermissionIds((currentIds) => currentIds.includes(permissionId)
            ? currentIds.filter((id) => id !== permissionId)
            : [...currentIds, permissionId]);
    }

    async function savePermissions() {
        if (!selectedRole) {
            return;
        }

        const currentPermissionIds = selectedRole.permissions.map(getPermissionId);
        const permissionsToAdd = selectedPermissionIds.filter((id) => !currentPermissionIds.includes(id));
        const permissionsToRemove = currentPermissionIds.filter((id) => !selectedPermissionIds.includes(id));

        await Promise.all([
            permissionsToAdd.length > 0 && addPermissionsMutation.mutateAsync({
                roleId: selectedRole._id,
                permissionIds: permissionsToAdd,
            }),
            permissionsToRemove.length > 0 && removePermissionsMutation.mutateAsync({
                roleId: selectedRole._id,
                permissionIds: permissionsToRemove,
            }),
        ]);

        setSelectedRole(null);
    }

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Gestione Ruoli Utente</h2>
                    <p className="text-muted-foreground">Associa o dissocia i permessi dai ruoli.</p>
                </div>
            </div>

            {(rolesQuery.isPending || permissionsQuery.isPending) && (
                <p className="text-sm text-muted-foreground">Caricamento ruoli e permessi...</p>
            )}
            {(rolesQuery.isError || permissionsQuery.isError) && (
                <p className="text-sm text-destructive" role="alert">{getErrorMessage(error)}</p>
            )}
            {rolesQuery.isSuccess && (
                <div className="grid gap-4 md:grid-cols-2">
                    {rolesQuery.data.map((role) => (
                        <Card key={role._id}>
                            <CardHeader>
                                <CardTitle className="text-lg">{role.roleName}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <p className="text-muted-foreground">{role.description || "Nessuna descrizione"}</p>
                                <div className="flex items-center justify-between">
                                    <p className="font-medium">Permessi: {role.permissions.length}</p>
                                    <Button type="button" variant="outline" onClick={() => openPermissionEditor(role)} disabled={!canAssignPermissions}>
                                        Modifica permessi
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {role.permissions.map((permission) => (
                                        <span key={getPermissionId(permission)} className="rounded-full bg-muted px-2.5 py-1 text-xs">
                                            {getPermissionLabel(permission)}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {selectedRole && permissionsQuery.isSuccess && (
                <div className="space-y-5 rounded-lg border bg-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Permessi ruolo {selectedRole.roleName}</h3>
                            <p className="text-sm text-muted-foreground">Seleziona i permessi da associare al ruolo.</p>
                        </div>
                        <Button type="button" variant="ghost" aria-label="Chiudi editor permessi" onClick={() => setSelectedRole(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {permissionsQuery.data.map((permission) => {
                            const isSelected = selectedPermissionIds.includes(permission._id);
                            return (
                                <label key={permission._id} className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50">
                                    <input
                                        type="checkbox"
                                        className="mt-1"
                                        checked={isSelected}
                                        onChange={() => togglePermission(permission._id)}
                                    />
                                    <span className="min-w-0">
                                        <span className="block font-medium">{permission.label}</span>
                                        <span className="block text-xs text-muted-foreground">{permission.description || permission.name}</span>
                                    </span>
                                    {isSelected && <Check className="ml-auto h-4 w-4 shrink-0 text-primary" />}
                                </label>
                            );
                        })}
                    </div>
                    {(addPermissionsMutation.isError || removePermissionsMutation.isError) && (
                        <p className="text-sm text-destructive" role="alert">
                            {getErrorMessage(addPermissionsMutation.error ?? removePermissionsMutation.error)}
                        </p>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setSelectedRole(null)}>Annulla</Button>
                        <Button type="button" disabled={isSaving} onClick={() => void savePermissions()}>
                            {isSaving ? "Salvataggio..." : "Salva permessi"}
                        </Button>
                    </div>
                </div>
            )}
        </section>
    );
}