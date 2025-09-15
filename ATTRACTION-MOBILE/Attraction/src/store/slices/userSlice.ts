import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FavoritePlace {
  id: number;
  address: string;
  type: string;
}

export interface User {
  id?: number; // dal backend (readOnly)
  username: string;
  email: string;
  type?: "student" | "worker" | "other"; // dal backend (readOnly)
  codice_fiscale?: string; // dal backend (readOnly)
  favorite_places?: FavoritePlace[]; // dal backend (readOnly)
  avatar?: string; // extra frontend, non nel backend
}

const initialState: User | null = null;

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => action.payload,
    clearUser: () => null,
    updateUser: (state, action: PayloadAction<Partial<User>>) =>
      state ? { ...state, ...action.payload } : state,
  },
});

export const { setUser, clearUser, updateUser } = userSlice.actions;
export default userSlice.reducer;


