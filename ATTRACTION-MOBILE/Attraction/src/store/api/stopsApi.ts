// src/store/api/stopsApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_CONFIG } from "../../config/apiConfig";
import { Stop, StopSchedule } from "../types/stop";

export const stopsApi = createApi({
  reducerPath: "stopsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.BASE_URL}auth/`,
    prepareHeaders: (headers) => {
      Object.entries(API_CONFIG.HEADERS).forEach(([k, v]) => {
        headers.set(k, v as string);
      });
      return headers;
    },
  }),
  tagTypes: ["Stop"],
  endpoints: (builder) => ({
    // GET tutte le fermate
    getStops: builder.query<Stop[], void>({
      query: () => "stops/",
      providesTags: ["Stop"],
    }),

    // GET orari di una fermata specifica
    getStopSchedule: builder.query<StopSchedule, string>({
      query: (stopId) => `station/${stopId}/`,
      providesTags: (result, error, stopId) => [{ type: "Stop", id: stopId }],
    }),
  }),
});

export const { useGetStopsQuery, useGetStopScheduleQuery } = stopsApi;
