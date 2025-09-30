// src/store/api/planTripApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_CONFIG } from "../../config/apiConfig";
import { PlanTripRequest, PlanTripResponse } from "../types/planTrip";

export const planTripApi = createApi({
  reducerPath: "planTripApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.BASE_URL}auth/`,
    prepareHeaders: (headers) => {
      Object.entries(API_CONFIG.HEADERS).forEach(([k, v]) =>
        headers.set(k, v as string)
      );
      return headers;
    },
  }),
  tagTypes: ["PlanTrip"],
  endpoints: (builder) => ({
    // POST /api/auth/plan-trip/
    planTrip: builder.mutation<PlanTripResponse, PlanTripRequest>({
      query: (body) => ({
        url: "plan-trip/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PlanTrip"],
    }),
  }),
});

export const { usePlanTripMutation } = planTripApi;

