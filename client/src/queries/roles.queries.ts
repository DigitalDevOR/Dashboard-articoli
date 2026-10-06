import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    addPermissionsToRole,
    getRoles,
    removePermissionsFromRole,
} from "../api/roles.api";
import { queryKeys } from "./queryKeys";

export function useRoles() {
    return useQuery({
        queryKey: queryKeys.roles.all,
        queryFn: getRoles,
    });
}

type RolePermissionsInput = {
    roleId: string;
    permissionIds: string[];
};

export function useAddPermissionsToRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: RolePermissionsInput) => addPermissionsToRole(input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
        },
    });
}

export function useRemovePermissionsFromRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: RolePermissionsInput) => removePermissionsFromRole(input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
        },
    });
}