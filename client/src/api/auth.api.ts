import { apiClient } from "./apiClient";
import type { User } from "./users.api";

export type LoginInput = {
    email: string;
    password: string;
};

export type LoginResponse = {
    message: string;
};

export type CurrentUserResponse = {
    user: User;
};

export type MessageResponse = {
    message: string;
};

export async function login(input: LoginInput): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/login", input);
    return response.data;
}

export async function getCurrentUser(): Promise<User> {
    const response = await apiClient.get<CurrentUserResponse>("/auth/me");
    return response.data.user;
}

export async function logout(): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>("/auth/logout");
    return response.data;
}