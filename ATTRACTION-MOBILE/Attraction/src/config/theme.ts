import { MD3LightTheme as DefaultTheme } from "react-native-paper";

export const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#50b948",
    secondary: "#45c3d6",
    background: "#F5F9F6",
    surface: "#FFFFFF",
    text: "#333333",
    error: "#D32F2F",
  },
  fonts: {
    ...DefaultTheme.fonts,
    bodyLarge: { fontFamily: "Montserrat-Regular" },
    bodyMedium: { fontFamily: "Montserrat-Regular" },
    bodySmall: { fontFamily: "Montserrat-Light" },
    titleLarge: { fontFamily: "Montserrat-Bold" },
    titleMedium: { fontFamily: "Montserrat-SemiBold" },
  },
};
