import axios from "axios";

export function getErrorMessage(error: unknown, fallback = "Operazione non riuscita.") {
    if (axios.isAxiosError<{ message?: string }>(error)) {
        return error.response?.data?.message ?? error.message ?? fallback;
    }

    return error instanceof Error ? error.message : fallback;
}