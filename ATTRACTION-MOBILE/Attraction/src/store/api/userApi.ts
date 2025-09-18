// src/store/api/userApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { API_CONFIG } from "../../config/apiConfig";
import { User } from "../slices/userSlice";

// Tipizzazione della risposta wrapper dell’API
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status_code: number;
}

export const userApi = createApi({
  reducerPath: "userApi",
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
    // GET /profile/
    getProfile: builder.query<User, void>({
      query: () => ({
        url: "profile/",
        method: "GET",
      }),
      // normalizziamo la risposta prendendo solo data
      transformResponse: (response: ApiResponse<User>) => response.data,
    }),

    // PUT /profile/
    updateProfile: builder.mutation<User, { username: string; email: string }>({
      query: (body) => ({
        url: "profile/",
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<User>) => response.data,
    }),

    // PATCH /profile/
    patchProfile: builder.mutation<User, Partial<{ username: string; email: string }>>({
      query: (body) => ({
        url: "profile/",
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<User>) => response.data,
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  usePatchProfileMutation,
} = userApi;


