import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_CONFIG } from "../../config/apiConfig";
import type { RootState } from "../store";
import { Place } from "../types/place";

export const placesApi = createApi({
  reducerPath: "placesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.BASE_URL}auth/`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.access;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getPlaces: builder.query<Place[], void>({
      query: () => "places/",
    }),
    createPlace: builder.mutation<Place, Partial<Place>>({
      query: (body) => ({
        url: "places/",
        method: "POST",
        body,
      }),
    }),
    updatePlace: builder.mutation<Place, { id: number; body: Partial<Place> }>({
      query: ({ id, body }) => ({
        url: `places/${id}/`,
        method: "PUT",
        body,
      }),
    }),
    deletePlace: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `places/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetPlacesQuery,
  useCreatePlaceMutation,
  useUpdatePlaceMutation,
  useDeletePlaceMutation,
} = placesApi;


