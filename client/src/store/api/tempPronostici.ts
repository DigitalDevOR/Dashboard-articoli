import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Odd {
  id: number;
  fixture_id: number;
  market_id: number;
  bookmaker_id: number;
  label: string;
  value?: string;
  sort_order?: number;
  market_description?: string;
  name?: string | null;
  probability?: number | null;
  dp3?: string;
  fractional?: string | null;
  american?: string | null;
  winning: boolean;
  stopped: boolean;
  total?: number | null;
  handicap?: string | null;
  partecipants?: any[] | null;
  created_at?: string;
  original_label?: string | null;
  latest_bookmaker_update: string;
}

export interface TempPronostico {
  _id: string;
  fixtureId: string;
  home: string;
  away: string;
  odd: Odd;
  legaId: string;
  UserId: string;
}

export const tempPronosticiApi = createApi({
  reducerPath: "tempPronosticiApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL + "/api/temp-pronostici",
    credentials: "include", // <--- aggiungi questa riga
  }),
  tagTypes: ["TempPronostici"],
  endpoints: (builder) => ({
    // Recupera tutti i pronostici temporanei dell'utente per una lega
    getTempPronosticiByLega: builder.query<TempPronostico[], string>({
      query: (legaId) => `/${legaId}`,
      providesTags: (result, error, legaId) =>
        result
          ? [
            ...result.map(({ _id }) => ({ type: "TempPronostici" as const, id: _id })),
            { type: "TempPronostici", id: "LIST" },
          ]
          : [{ type: "TempPronostici", id: "LIST" }],
    }),
    // Crea un nuovo pronostico temporaneo
    createTempPronostico: builder.mutation<TempPronostico, Partial<TempPronostico>>({
      query: (body) => ({
        url: `/`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "TempPronostici", id: "LIST" }],
    }),
    // Cancella un pronostico temporaneo per id
    deleteTempPronostico: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "TempPronostici", id: "LIST" }],
    }),
  }),
});

export const {
  useGetTempPronosticiByLegaQuery,
  useCreateTempPronosticoMutation,
  useDeleteTempPronosticoMutation,
} = tempPronosticiApi;