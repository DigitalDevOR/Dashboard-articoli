import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createUser,
    deleteUser,
    getUsers,
    updateUser,
    updateUserEmail,
    updateUserPassword,
    type CreateUserInput,
    type UpdateUserInput,
} from "../api/users.api";
import { queryKeys } from "./queryKeys";

export function useUsers() {
    return useQuery({
        queryKey: queryKeys.users.all,
        queryFn: getUsers,
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateUserInput) => createUser(input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpdateUserInput) => updateUser(input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}

export function useUpdateUserPassword() {
    return useMutation({
        mutationFn: updateUserPassword,
    });
}

export function useUpdateUserEmail() {
    return useMutation({
        mutationFn: updateUserEmail,
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => deleteUser(userId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}