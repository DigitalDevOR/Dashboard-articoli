import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Tipi di risposta (adatta se necessario)
export interface Match {
  id: number;
  starting_at_timestamp: number;
  // ...altri campi utili...
}

export interface League {
  id: number;
  name: string;
  today: Match[];
  // ...altri campi utili...
}

export interface FetchedCalendarsResponse {
  FetchedCalendars: {
    data: League[];
  };
}

export const syncedPoolDataApi = createApi({
  reducerPath: "syncedPoolDataApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  }),
  endpoints: (builder) => ({
    getLeaguesByDate: builder.query<FetchedCalendarsResponse, string>({
      query: (date) => `/api/synced-pool-data?date=${date}`,
    }),
    getMatchDataById: builder.query<any, { id: string, leagueId?: string }>({
      query: ({ id, leagueId }) => ({
        url: `/api/synced-pool-data/match?matchId=${id}&leagueId=${leagueId}`,
        method: 'GET',
        credentials: 'include',
      }),
    }),
    getMatchPredictionsById: builder.query<any, { fixtureId: string }>({
      query: ({ fixtureId }) => ({
        url: `/api/synced-pool-data/predictions?fixtureId=${fixtureId}`,
        method: 'GET',
        credentials: 'include',
      }),
    }),
    getMatchLineupByFixtureId: builder.query<any, { fixtureId: string }>({
      query: ({ fixtureId }) => ({
        url: `/api/lineups/lineup?fixture_id=${fixtureId}`,
        method: 'GET',
        credentials: 'include',
      }),
    }),
    getMatchStatisticsById: builder.query<any, { fixtureId: string }>({
      query: ({ fixtureId }) => ({
        url: `/api/fixture-statistics?fixtureId=${fixtureId}`,
        method: 'GET',
        credentials: 'include',
      }),
    }),
    getMatchSidelinedPlayersByFixtureId: builder.query<any, { fixtureId: string }>({
      query: ({ fixtureId }) => ({
        url: `/api/sideline-players?fixtureId=${fixtureId}`,
        method: 'GET',
        credentials: 'include',
      }),
    }),
  }),
});

export const { useGetLeaguesByDateQuery, useGetMatchDataByIdQuery, useGetMatchPredictionsByIdQuery, useGetMatchLineupByFixtureIdQuery, useGetMatchStatisticsByIdQuery, useGetMatchSidelinedPlayersByFixtureIdQuery } = syncedPoolDataApi;

