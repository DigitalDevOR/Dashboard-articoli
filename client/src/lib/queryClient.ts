import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "./errorMessage";
import { useToastStore } from "../store/toast.store";

function getSuccessMessage(data: unknown) {
    if (typeof data === "object" && data !== null && "message" in data) {
        const message = data.message;
        if (typeof message === "string") {
            return message;
        }
    }

    return "Operazione completata con successo.";
}

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error, query) => {
            if (query.meta?.silentGlobalError === true) {
                return;
            }

            useToastStore.getState().addToast({
                title: "Errore",
                description: getErrorMessage(error),
                variant: "error",
            });
        },
    }),
    mutationCache: new MutationCache({
        onSuccess: (data) => {
            useToastStore.getState().addToast({
                title: "Operazione completata",
                description: getSuccessMessage(data),
                variant: "success",
            });
        },
        onError: (error) => {
            useToastStore.getState().addToast({
                title: "Operazione non riuscita",
                description: getErrorMessage(error),
                variant: "error",
            });
        },
    }),
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: false,
        },
    },
});