import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '../store/axiosBaseQuery'

export interface TripHistoryItem {
    id: number
    anonymous_session_key: string | null
    from_lat: number
    from_lon: number
    to_lat: number
    to_lon: number
    trip_date: string
    requested_at: string
    modes: string | null
    user: any | null
}

export const tripHistoryApi = createApi({
    reducerPath: 'tripHistoryApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['TripHistory'],
    endpoints: (builder) => ({
        getTripHistory: builder.query<TripHistoryItem[], void>({
            query: () => ({
                url: '/search/',
                method: 'GET',
            }),
            providesTags: ['TripHistory'],
            transformResponse: (response: TripHistoryItem[]) => {
                // Sort by most recent first
                return response.sort((a, b) => 
                    new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
                );
            },
        }),
        deleteTripHistoryItem: builder.mutation<void, number>({
            query: (id) => ({
                url: `/search/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['TripHistory'],
        }),
    }),
})

export const {
    useGetTripHistoryQuery,
    useDeleteTripHistoryItemMutation,
} = tripHistoryApi
