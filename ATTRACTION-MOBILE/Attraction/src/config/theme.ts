import { MD3LightTheme as DefaultTheme } from "react-native-paper";

export const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#2E8B57",   // Verde secco (azioni principali)
    secondary: "#1E90FF", // Blu acceso (accenti, bottoni secondari)
    background: "#F5F9F6", // Sfondo chiaro
    surface: "#FFFFFF",   // Card/Input
    text: "#333333",      // Testo primario
    error: "#D32F2F",     // Rosso per errori
  },
};
