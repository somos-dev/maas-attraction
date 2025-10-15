// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  access: string | null;
  refresh: string | null;
  isAnonymous: boolean;
}

const initialState: AuthState = {
  access: null,
  refresh: null,
  isAnonymous: false,
};

interface SetCredentialsPayload {
  access: string;
  refresh: string;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
      state.isAnonymous = false;
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.access = action.payload;
    },
    clearAuth: (state) => {
      state.access = null;
      state.refresh = null;
      state.isAnonymous = false;
    },
    setAnonymous: (state) => {
      state.access = null;
      state.refresh = null;
      state.isAnonymous = true;
    },
  },
});

export const { setCredentials, updateAccessToken, clearAuth, setAnonymous } =
  authSlice.actions;

export default authSlice.reducer;
