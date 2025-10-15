// src/store/slices/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FavoritePlace {
  id: number;
  address: string;
  type: string;
}

export type UserType = "student" | "worker" | "other";

export interface User {
  id?: number;                          // dal backend
  username: string;                     // editabile
  email: string;                        // cambia solo dopo conferma via link HTML
  type?: UserType;                      // editabile (student|worker|other)
  codice_fiscale?: string;              // read-only dal backend
  favorite_places?: FavoritePlace[];    // read-only dal backend
  avatar?: string;                      // extra frontend
}

const initialState: User | null = null;

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (_state, action: PayloadAction<User>) => action.payload,
    clearUser: () => null,
    updateUser: (state, action: PayloadAction<Partial<User>>) =>
      state ? { ...state, ...action.payload } : state,
  },
});

export const { setUser, clearUser, updateUser } = userSlice.actions;
export default userSlice.reducer;
