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

export const legheApi = createApi({
  reducerPath: "legheApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  }),
  tagTypes: ["Lega"],
  endpoints: (builder) => ({
    getLeghe: builder.query<Tournament[], void>({
      query: () => "/api/leghe",
      providesTags: ["Lega"],
      keepUnusedDataFor: 300, // 5 minuti
    }),

    getLegaById: builder.query<Tournament, string>({
      query: (id) => `/api/leghe/${id}`,
      providesTags: (result, error, id) => [{ type: "Lega", id }],
      keepUnusedDataFor: 300, // 5 minuti
    }),

    IscrivitiLega: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/api/leghe/${id}/iscriviti`,
        method: "POST",
        credentials: "include",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Lega", id }],
    }),

    getLegheByUser: builder.query<Tournament[], void>({
      query: () => ({
        url: "/api/leghe/user-leghe",
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useGetLegheQuery,
  useGetLegaByIdQuery,
  useIscrivitiLegaMutation,
  useGetLegheByUserQuery,
} = legheApi;
