/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

// App.tsx
import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { PaperProvider } from "react-native-paper";

import { store, persistor } from "./src/store/store"; 
import AppNavigator from "./src/navigation/AppNavigator";
import { appTheme } from "./src/config/theme";


        //  import AsyncStorage from '@react-native-async-storage/async-storage';
        //  AsyncStorage.clear();

export default function App() {
  return (
 <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={appTheme}>
          <AppNavigator />
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
}
