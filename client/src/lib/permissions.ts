import type { User } from "../api/users.api";

export function isSuperAdmin(user: User | undefined) {
    return user?.isSuperAdmin === true;
}

export function hasPermission(user: User | undefined, permissionName: string) {
    if (isSuperAdmin(user)) {
        return true;
    }

    const rolePermissions = user?.siteAccess?.role && typeof user.siteAccess.role !== "string"
        ? user.siteAccess.role.permissions
        : [];
    const additionalPermissions = user?.siteAccess?.additionalPermissions ?? [];
    const permissions = [...rolePermissions, ...additionalPermissions];

    return permissions.some((permission) =>
        typeof permission !== "string" &&
        permission.name === permissionName &&
        permission.isActive,
    );
}
