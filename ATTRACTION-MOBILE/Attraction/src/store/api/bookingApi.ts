import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQueryWithReauth} from './baseQueryWithReauth';

export interface Booking {
  id: number;
  user_id: number;
  origin: string;
  destination: string;
  time: string;
  mode: string;
  distance_km?: number;
  total_distance_m?: number;
  co2_kg?: number;
  co2_saved_kg?: number;
}

export interface BookingRequest {
  origin: string;
  destination: string;
  time: string;
  mode: string;
  distance_km?: number;
  total_distance_m?: number;
}

const normalize = (res: any): any => {
  if (!res) return null;
  if (typeof res === 'object' && 'success' in res) {
    return res.data ?? null;
  }
  return res;
};

export const bookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Booking'],
  endpoints: builder => ({
    // 🔹 POST /booking/
    createBooking: builder.mutation<Booking, BookingRequest>({
      query: body => ({
        url: 'booking/',
        method: 'POST',
        body,
      }),
      transformResponse: res => normalize(res) as Booking,
      invalidatesTags: ['Booking'],
    }),

    // 🔹 GET /booking/
    getBookings: builder.query<Booking[], void>({
      query: () => ({
        url: 'booking/',
        method: 'GET',
      }),
      transformResponse: res => {
        const data = normalize(res);
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'object' && 'data' in data) return data.data;
        return [data];
      },
      providesTags: ['Booking'],
    }),
  }),
});

export const {useCreateBookingMutation, useGetBookingsQuery} = bookingApi;
