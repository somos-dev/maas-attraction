import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Interfaccia per l'utente
export interface User {
  username: string;
  email: string;
  codice_fiscale?: string;
  type?: string; // "studente", "lavoratore", ecc.
  avatar?: string;
  transportPreferences?: string[];
}

// Stato iniziale
const initialState: User = {
  username: "",
  email: "",
  codice_fiscale: "",
  type: "",
  avatar: "",
  transportPreferences: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      const user = action.payload;
      Object.assign(state, user);
      AsyncStorage.setItem("user", JSON.stringify(user));
    },
    clearUser: (state) => {
      Object.assign(state, initialState);
      AsyncStorage.removeItem("user");
    },
    setAvatar: (state, action: PayloadAction<string>) => {
      state.avatar = action.payload;
      AsyncStorage.setItem("user", JSON.stringify(state));
    },
    setTransportPreferences: (state, action: PayloadAction<string[]>) => {
      state.transportPreferences = action.payload;
      AsyncStorage.setItem("user", JSON.stringify(state));
    },
  },
});

export const { setUser, clearUser, setAvatar, setTransportPreferences } =
  userSlice.actions;

// Azione asincrona per recuperare i dati salvati
export const fetchUser = () => async (dispatch: any) => {
  const user = await AsyncStorage.getItem("user");
  if (user) {
    dispatch(setUser(JSON.parse(user)));
  }
};

export default userSlice.reducer;
