// src/config/theme.ts
import { MD3LightTheme as DefaultLightTheme, MD3DarkTheme as DefaultDarkTheme } from "react-native-paper";

export const lightTheme = {
  ...DefaultLightTheme,
  colors: {
    ...DefaultLightTheme.colors,
    primary: "#50b948",
    secondary: "#45c3d6",
    background: "#F5F9F6",
    surface: "#FFFFFF",
    text: "#333333",
    error: "#D32F2F",
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
    onSurface: "#000000ff",
    onSurfaceVariant: "#a7a9aa"
  },
  fonts: {
    ...DefaultLightTheme.fonts,
    bodyLarge:   { fontFamily: "Montserrat-Regular",  fontWeight: "400" },
    bodyMedium:  { fontFamily: "Montserrat-Regular",  fontWeight: "400" },
    bodySmall:   { fontFamily: "Montserrat-Light",    fontWeight: "300" },
    titleLarge:  { fontFamily: "Montserrat-Bold",     fontWeight: "700" ,fontSize: 20},
    titleMedium: { fontFamily: "Montserrat-SemiBold", fontWeight: "600" },
    labelLarge:  { fontFamily: "Montserrat-Medium",   fontWeight: "500" },
  },
  typography: {
    headerTitle: {
      fontSize: 20,
      fontWeight: "600",
      fontFamily: "Montserrat-SemiBold",
    },
  },
};

export const darkTheme = {
  ...DefaultDarkTheme,
  colors: {
    ...DefaultDarkTheme.colors,
    primary: "#50b948",     // Verde coerente brand
    secondary: "#45c3d6",   // Blu coerente brand
    background: "#121212",  // Sfondo principale scuro
    surface: "#1E1E1E",     // Card/Input scuri
    text: "#E0E0E0",        // Testo chiaro
    error: "#CF6679",
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
    onSurface: "#E0E0E0",   // Testo su card
    outline: "#444444",     // Bordi scuri
    onSurfaceVariant: "#a7a9aa"
  },
  fonts: {
    ...DefaultDarkTheme.fonts,
    bodyLarge:   { fontFamily: "Montserrat-Regular",  fontWeight: "400" },
    bodyMedium:  { fontFamily: "Montserrat-Regular",  fontWeight: "400" },
    bodySmall:   { fontFamily: "Montserrat-Light",    fontWeight: "300" },
    // titleLarge:  { fontFamily: "Montserrat-Bold",     fontWeight: "700" ,fontSize: 20},
    // titleMedium: { fontFamily: "Montserrat-SemiBold", fontWeight: "600" },
    labelLarge:  { fontFamily: "Montserrat-Medium",   fontWeight: "500" },
    labelMedium: { fontFamily: "Aadhunik", fontWeight: "500" },
    titleLarge:  { fontFamily: "Isonorm", fontWeight: "700" ,fontSize: 20},
    titleMedium: { fontFamily: "Isonorm", fontWeight: "600" },

  },
  typography: {
    headerTitle: {
      fontSize: 20,
      fontWeight: "600",
      fontFamily: "Montserrat-SemiBold",
    },
  },
};



