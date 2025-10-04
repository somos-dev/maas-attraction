// src/store/api/authApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import type { User } from "../slices/authSlice";

// ---- Request types ----
interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  codice_fiscale?: string;
  type?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LogoutRequest {
  refresh: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  uidb64: string;
  token: string;
  password: string;
}

// ---- Response types ----
interface LoginResponse {
  access: string;
  refresh: string;
  user?: User;
}

interface RegisterResponse {
  access: string;
  refresh: string;
  user?: User;
}

interface MessageResponse {
  status: number;
  message: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: "register/",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "login/",
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<void, LogoutRequest>({
      query: (body) => ({
        url: "logout/",
        method: "POST",
        body,
      }),
    }),
    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: "password-reset/",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
      query: ({ uidb64, token, password }) => ({
        url: `password-reset-confirm/${uidb64}/${token}/`,
        method: "POST",
        body: { password },
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;



