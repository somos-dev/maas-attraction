import { createSlice } from "@reduxjs/toolkit";

interface ThemeState {
  isDarkTheme: boolean;
}

const initialState: ThemeState = {
  isDarkTheme: false, // di default light
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkTheme = !state.isDarkTheme;
    },
    setTheme: (state, action) => {
      state.isDarkTheme = action.payload;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
