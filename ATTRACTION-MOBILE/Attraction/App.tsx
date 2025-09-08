/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

// App.tsx
import React from "react";
import { Provider } from "react-redux";
import { PaperProvider } from "react-native-paper";
import { store } from "./src/store/store";
import AppNavigator from "./src/navigation/AppNavigator";
import { appTheme } from "./src/config/theme"; // 👈 importa il tema

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider theme={appTheme}>
        <AppNavigator />
      </PaperProvider>
    </Provider>
  );
}


