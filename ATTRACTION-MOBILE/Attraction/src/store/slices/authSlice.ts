//BOZZA

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Definisci un'interfaccia per l'utente
export interface User {
  username: string;
  email: string;
  type?: string; // es. "Studente" o "Lavoratore"
  codice_fiscale?: string;
}

interface AuthState {
  access: string | null;
  refresh: string | null;
  user: User | null;
}

const initialState: AuthState = {
  access: null,
  refresh: null,
  user: null,
};

interface SetCredentialsPayload {
  access: string;
  refresh: string;
  user?: User;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
      state.user = action.payload.user || null;
    },
    clearAuth: (state) => {
      state.access = null;
      state.refresh = null;
      state.user = null;
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.access = action.payload;
    },
  },
});

export const { setCredentials, clearAuth, updateAccessToken } = authSlice.actions;
export default authSlice.reducer;

