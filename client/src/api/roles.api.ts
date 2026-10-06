import { apiClient } from "./apiClient";
import type { Permission } from "./permissions.api";

export type Role = {
    _id: string;
    roleName: "Admin" | "Editor";
    description?: string;
    permissions: Array<string | Permission>;
    isActive: boolean;
};

type RolesResponse = {
    roles: Role[];
};

type RoleResponse = {
    role: Role;
};

type RolePermissionsInput = {
    roleId: string;
    permissionIds: string[];
};

type RoleMessageResponse = {
    message: string;
    role: Role;
};

export async function getRoles(): Promise<Role[]> {
    const response = await apiClient.get<RolesResponse>("/roles");
    return response.data.roles;
}

export async function addPermissionsToRole(input: RolePermissionsInput): Promise<Role> {
    const response = await apiClient.post<RoleResponse>("/roles/add-permissions-role", input);
    return response.data.role;
}

export async function removePermissionsFromRole(input: RolePermissionsInput): Promise<Role> {
    const response = await apiClient.post<RoleResponse>("/roles/remove-permissions-role", input);
    return response.data.role;
}

export type { RoleMessageResponse };