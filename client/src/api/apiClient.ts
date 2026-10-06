import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");
const apiBaseUrl = configuredBaseUrl
    ? configuredBaseUrl.endsWith("/api")
        ? configuredBaseUrl
        : `${configuredBaseUrl}/api`
    : "/api";

export const apiClient = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});