/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from "react";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { PaperProvider } from "react-native-paper";

import { store, persistor, RootState } from "./src/store/store"; 
import AppNavigator from "./src/navigation/AppNavigator";
import { lightTheme, darkTheme } from "./src/config/theme";

  // import AsyncStorage from '@react-native-async-storage/async-storage';
  // AsyncStorage.clear();

  function ThemedApp() {
  const isDark = useSelector((state: RootState) => state.theme.isDarkTheme);

  return (
    <PaperProvider theme={isDark ? darkTheme : lightTheme}>
      <AppNavigator />
    </PaperProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemedApp />
      </PersistGate>
    </Provider>
  );
}
