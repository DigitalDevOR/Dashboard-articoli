import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, login, logout, type LoginInput } from "../api/auth.api";
import { updateUserEmail, updateUserPassword } from "../api/users.api";
import { queryKeys } from "./queryKeys";

export function useCurrentUser() {
    return useQuery({
        queryKey: queryKeys.auth.currentUser,
        queryFn: getCurrentUser,
        retry: false,
        meta: { silentGlobalError: true },
    });
}

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: LoginInput) => {
            const response = await login(input);
            const user = await getCurrentUser();

            return { ...response, user };
        },
        onSuccess: ({ user }) => {
            queryClient.removeQueries();
            queryClient.setQueryData(queryKeys.auth.currentUser, user);
        },
    });
}

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logout,
        onSuccess: () => queryClient.clear(),
    });
}

export function useUpdateProfileEmail() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateUserEmail,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser });
        },
    });
}

export function useUpdateProfilePassword() {
    return useMutation({
        mutationFn: updateUserPassword,
    });
}