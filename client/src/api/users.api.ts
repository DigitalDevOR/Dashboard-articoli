import { apiClient } from "./apiClient";
import type { Permission } from "./permissions.api";
import type { Role } from "./roles.api";
import type { WordpressSite } from "./wordpressSites.api";

export type UserSiteAccess = {
    siteId: string | WordpressSite;
    role: string | Role;
    additionalPermissions: Array<string | Permission>;
};

export type User = {
    _id: string;
    nome: string;
    cognome: string;
    email: string;
    isSuperAdmin: boolean;
    siteAccess?: UserSiteAccess;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type CreateUserInput = {
    nome: string;
    cognome: string;
    email: string;
    password: string;
    isActive?: boolean;
    siteAccess?: {
        siteId: string;
        role: string;
        additionalPermissions?: string[];
    };
};

export type UpdateUserInput = {
    userId: string;
    nome?: string;
    cognome?: string;
    email?: string;
    password?: string;
    isActive?: boolean;
    siteAccess?: CreateUserInput["siteAccess"];
};

type UsersResponse = {
    users: User[];
};

type UserResponse = {
    user: User;
};

type MessageResponse = {
    message: string;
};

export async function getUsers(): Promise<User[]> {
    const response = await apiClient.get<UsersResponse>("/users");
    return response.data.users;
}

export async function createUser(input: CreateUserInput): Promise<User> {
    const response = await apiClient.post<UserResponse>("/users/create-user", input);
    return response.data.user;
}

export async function updateUser(input: UpdateUserInput): Promise<User> {
    const response = await apiClient.post<UserResponse>("/users/update-user", input);
    return response.data.user;
}

export async function updateUserPassword(input: {
    oldPassword: string;
    password: string;
}): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>("/users/update-user-password", input);
    return response.data;
}

export async function updateUserEmail(email: string): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>("/users/update-user-email", { email });
    return response.data;
}

export async function deleteUser(userId: string): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>(`/users/${userId}`);
    return response.data;
}