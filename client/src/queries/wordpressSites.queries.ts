import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    createWordpressSite,
    deleteWordpressSite,
    getWordpressSiteById,
    getWordpressSites,
    updateWordpressSite,
    type CreateWordpressSiteInput,
    type UpdateWordpressSiteInput,
} from "../api/wordpressSites.api";
import { queryKeys } from "./queryKeys";

export function useWordpressSites(enabled = true) {
    return useQuery({
        queryKey: queryKeys.wordpressSites.all,
        queryFn: getWordpressSites,
        enabled,
    });
}

export function useWordpressSite(siteId: string) {
    return useQuery({
        queryKey: queryKeys.wordpressSites.detail(siteId),
        queryFn: () => getWordpressSiteById(siteId),
        enabled: Boolean(siteId),
    });
}

export function useCreateWordpressSite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateWordpressSiteInput) => createWordpressSite(input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.wordpressSites.all,
            });
        },
    });
}

export function useUpdateWordpressSite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            siteId,
            input,
        }: {
            siteId: string;
            input: UpdateWordpressSiteInput;
        }) => updateWordpressSite(siteId, input),
        onSuccess: async (_site, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: queryKeys.wordpressSites.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: queryKeys.wordpressSites.detail(variables.siteId),
                }),
            ]);
        },
    });
}

export function useDeleteWordpressSite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (siteId: string) => deleteWordpressSite(siteId),
        onSuccess: async (_response, siteId) => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.wordpressSites.all,
            });
            queryClient.removeQueries({
                queryKey: queryKeys.wordpressSites.detail(siteId),
            });
        },
    });
}