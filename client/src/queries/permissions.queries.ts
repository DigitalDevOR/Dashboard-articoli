import { useQuery } from "@tanstack/react-query";
import { getPermissionById, getPermissions } from "../api/permissions.api";
import { queryKeys } from "./queryKeys";

export function usePermissions() {
    return useQuery({
        queryKey: queryKeys.permissions.all,
        queryFn: getPermissions,
    });
}

export function usePermission(permissionId: string) {
    return useQuery({
        queryKey: queryKeys.permissions.detail(permissionId),
        queryFn: () => getPermissionById(permissionId),
        enabled: Boolean(permissionId),
    });
}