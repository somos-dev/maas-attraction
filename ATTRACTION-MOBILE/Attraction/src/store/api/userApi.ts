// src/store/api/userApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import type { User } from "../slices/userSlice";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  status_code: number;
}

// Accetta envelope o JSON nudo
const asUserOrNull = (res: unknown): User | null => {
  if (!res || typeof res !== "object") return null;
  const obj = res as any;
  if ("success" in obj) return (obj.data ?? null) as User | null; // envelope
  if ("email" in obj || "username" in obj || "type" in obj) return obj as User; // JSON nudo
  return null;
};

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth, // punta a .../api/auth/
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    getProfile: builder.query<User, void>({
      query: () => ({
        url: "profile/",
        method: "GET",
        headers: { Accept: "application/json" },
      }),
      transformResponse: (res: unknown): User =>
        asUserOrNull(res) ?? (res as User),
      providesTags: ["Profile"],
    }),

    // PUT: usalo solo se vuoi inviare il payload completo (es. cambio email + altri campi)
    updateProfile: builder.mutation<
      User | null,
      Partial<Pick<User, "username" | "email" | "type">>
    >({
      query: (body) => ({
        url: "profile/",
        method: "PUT",
        body,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }),
      transformResponse: (res: unknown): User | null => asUserOrNull(res),
      invalidatesTags: ["Profile"],
    }),

    // PATCH: consigliato per modifiche parziali (username/type o anche email)
    patchProfile: builder.mutation<
      User | null,
      Partial<Pick<User, "username" | "email" | "type">>
    >({
      query: (body) => ({
        url: "profile/",
        method: "PATCH",
        body,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }),
      transformResponse: (res: unknown): User | null => asUserOrNull(res),
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  usePatchProfileMutation,
} = userApi;







