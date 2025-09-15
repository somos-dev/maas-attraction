import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type { User } from '../slices/authSlice';
import { API_CONFIG } from "../../config/apiConfig";

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

interface RefreshRequest {
  refresh: string;
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
  password: string;   // nuova password
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

interface RefreshResponse {
  access: string;
}

interface MessageResponse {
  status: number;
  message: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.BASE_URL}auth/`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.access;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: 'register/',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: 'login/',
        method: 'POST',
        body,
      }),
    }),
    refresh: builder.mutation<RefreshResponse, RefreshRequest>({
      query: (body) => ({
        url: 'token/refresh/',
        method: 'POST',
        body,
      }),
    }),
    logout: builder.mutation<void, LogoutRequest>({
      query: (body) => ({
        url: 'logout/',
        method: 'POST',
        body,
      }),
    }),

    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: 'password-reset/',
        method: 'POST',
        body,
      }),
    }),

    // corretto: uidb64 + token nell’URL
    resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
      query: ({ uidb64, token, password }) => ({
        url: `password-reset-confirm/${uidb64}/${token}/`,
        method: 'POST',
        body: { password },
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;


