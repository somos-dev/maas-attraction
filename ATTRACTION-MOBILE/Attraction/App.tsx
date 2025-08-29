/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

// App.tsx
import React from "react";
import { Provider } from "react-redux";
import { store } from "./src/store/store";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}


