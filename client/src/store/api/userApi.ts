/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // Aggiungi altre variabili env se necessario
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Tournament } from "../../lib/types";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    updateUserProfile: builder.mutation<
      any,
      {
        nome: string;
        cognome: string;
        userName: string;
        email: string;
        password?: string;
      }
    >({
      query: ({ nome, cognome, userName, email, password }) => ({
        url: "/api/user/update",
        method: "PUT",
        body: { nome, cognome, userName, email, password },
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
    resetUserPassword: builder.mutation<
      any,
      { newPassword: string; token: string }
    >({
      query: ({ newPassword, token }) => ({
        url: `/api/auth/reset-password-email/?token=${token}`,
        method: "POST",
        body: { newPassword },
      }),
    }),
    getUserSocialData: builder.query<any, void>({ // Nota il tipo `void` per i parametri
      query: () => ({
        url: `/api/user/user-info`,
        method: 'GET',
        credentials: 'include',
      }),
    }),
    sendInviteCode: builder.mutation<
      any,
      { inviteCode: string }
    >({
      query: ({ inviteCode }) => ({
        url: `/api/user/recive-inviteCode/${inviteCode}`,
        method: "POST",
        body: { inviteCode },
        credentials: "include",
      }),
    }),

    // add more endpoints as needed
  }),
});

export const { useUpdateUserProfileMutation, useResetUserPasswordMutation, useGetUserSocialDataQuery, useSendInviteCodeMutation } = userApi;
