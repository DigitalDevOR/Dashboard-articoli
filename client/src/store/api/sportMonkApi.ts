import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Tournament } from '../../lib/types';

export const sportMonkApi = createApi({
    reducerPath: 'sportMonkApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
    }),
    tagTypes: ['SportMonk'],
    endpoints: (builder) => ({
        getCalendarsByDate: builder.query<any, { date: string }>({
            query: ({ date }) => ({
                url: `/api/sportsmonk/calendars?date=${date}`,
                method: 'GET',
                credentials: 'include',
            }),
        }),
        getMatchDataById: builder.query<any, { id: string }>({
            query: ({ id }) => ({
                url: `/api/sportsmonk/matches/${id}`,
                method: 'GET',
                credentials: 'include',
            }),
        }),
        getPlayerDataById: builder.query<any, { playerId: string }>({
            query: ({ playerId }) => ({
                url: `/api/sportsmonk/player-data/${playerId}`,
                method: 'GET',
                credentials: 'include',
            }),
        }),
        getPlayerStatisticsById: builder.query<any, { playerId: string }>({
            query: ({ playerId }) => ({
                url: `/api/sportsmonk/player-statistics/${playerId}`,
                method: 'GET',
                credentials: 'include',
            }),
        }),
        getMatchPredictionsById: builder.query<any, { fixtureId: string }>({
            query: ({ fixtureId }) => ({
                url: `/api/sportsmonk/match-predictions/${fixtureId}`,
                method: 'GET',
                credentials: 'include',
            }),
        }),
        getMatchNewsById: builder.query<any, { matchId: string }>({
            query: ({ matchId }) => ({
                url: `/api/sportsmonk/match-news/${matchId}`,
                method: 'GET',
                credentials: 'include',
            }),
        }),
        getMatchsOfLeagueId: builder.query<any, { leagueId: string; page?: number; match_state_filter?: string; havingOdds?: string }>({
            query: ({ leagueId, page = 1, match_state_filter, havingOdds }) => ({
                url: `/api/sportsmonk/match-events-by-leagueid/${leagueId}/${page}/${match_state_filter}/${havingOdds}`,
                method: 'GET',
                credentials: 'include',
            }),
        }),
        getMatchPremiumOddsByFixtureId: builder.query<any, { fixtureId: string }>({
            query: ({ fixtureId }) => ({
                url: `/api/sportsmonk/premium-odds-by-fixtureid/${fixtureId}`,
                method: 'GET',
                credentials: 'include',
            }),
        }),
        getMatchStandardOddsByFixtureId: builder.query<any, { fixtureId: string }>({
            query: ({ fixtureId }) => ({
                url: `/api/sportsmonk/standard-odds-by-fixtureid/${fixtureId}`,
                method: 'GET',
                credentials: 'include',
            }),
        }),
        getAllBookmakers: builder.query<any, { page: number }>({
            query: ({ page }) => ({
                url: `/api/sportsmonk/all-bookmakers/${page}`,
                method: 'GET',
                credentials: 'include',
            }),
        }),
    }),
});

export const { useGetCalendarsByDateQuery, useGetMatchDataByIdQuery, useGetPlayerDataByIdQuery, useGetPlayerStatisticsByIdQuery, useGetMatchPredictionsByIdQuery, useGetMatchNewsByIdQuery, useGetMatchsOfLeagueIdQuery, useGetMatchPremiumOddsByFixtureIdQuery, useGetMatchStandardOddsByFixtureIdQuery, useGetAllBookmakersQuery } = sportMonkApi;