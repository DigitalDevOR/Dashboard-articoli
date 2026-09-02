// src/services/settingsApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Definizione dell'interfaccia per la risposta del server
export interface MatchState {
  id: number;
  state: string;
  name: string;
  short_name: string;
  developer_name: string;
  traduzione_ita: string;
}

// Crea l'API
export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  }),
  tagTypes: ["Settings"],
  endpoints: (builder) => ({
    getNotStartedMatchState: builder.query<MatchState, void>({
        query: () =>({ 
            url:  "/api/settings/not-started-state",
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        }),
     
        providesTags: (result) =>
        result ? [{ type: "Settings", id: "NOT_STARTED_STATE" }] : [{ type: "Settings" }],
    }),
  }),
});

// Esporta l’hook generato automaticamente
export const { useGetNotStartedMatchStateQuery } = settingsApi;
