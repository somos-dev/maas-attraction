// src/store/api/authApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

// --- Domain types ---
export type UserType = "student" | "worker" | "other";

// --- Request types ---
interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  codice_fiscale?: string;
  type?: UserType; //  tipizzato come nel backend
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

// ⚠️ (DEPRECATO lato mobile) Il reset vero avviene su HTML, non chiamarlo dall’app
// Lo lasciamo tipizzato solo per completezza, ma NON esporremo la mutation.
interface ResetPasswordRequest {
  uidb64: string;
  token: string;
  password: string;
}

// --- Response enveloping del backend ---
interface BackendEnvelope<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  status_code: number;
}

// Dati che tornano in RegisterView (dentro "data")
interface RegisterData {
  id: number;
  username: string;
  email: string;
  codice_fiscale?: string;
  type?: UserType;
}

// --- Response types ---
interface LoginResponse {
  access: string;
  refresh: string;
}

type RegisterResponse = BackendEnvelope<RegisterData>;

interface MessageResponse {
  status: number;
  message: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth, // deve puntare a .../api/auth/
  endpoints: (builder) => ({
    // REGISTER: ritorna envelope (NO token)
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: "register/",
        method: "POST",
        body,
      }),
    }),

    // LOGIN: TokenObtainPairView → solo {access, refresh}
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

    // PASSWORD RESET (invio email con link HTML)
    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: "password-reset/",
        method: "POST",
        body,
      }),
    }),

    // DEPRECATO: la conferma si fa su pagina HTML, non da app mobile
    // resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
    //   query: ({ uidb64, token, password }) => ({
    //     url: `password-reset-confirm/${uidb64}/${token}/`,
    //     method: "POST",
    //     body: { password },
    //   }),
    // }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  // useResetPasswordMutation, //non esporto
} = authApi;




