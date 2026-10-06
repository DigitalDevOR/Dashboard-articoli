import { apiClient } from "./apiClient";

export type Permission = {
    _id: string;
    name: string;
    label: string;
    category: string;
    description?: string;
    isActive: boolean;
};

type PermissionsResponse = {
    permissions: Permission[];
};

type PermissionResponse = {
    permission: Permission;
};

export async function getPermissions(): Promise<Permission[]> {
    const response = await apiClient.get<PermissionsResponse>("/permissions");
    return response.data.permissions;
}

export async function getPermissionById(permissionId: string): Promise<Permission> {
    const response = await apiClient.get<PermissionResponse>(`/permissions/${permissionId}`);
    return response.data.permission;
}