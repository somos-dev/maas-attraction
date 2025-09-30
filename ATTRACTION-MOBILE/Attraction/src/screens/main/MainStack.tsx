// src/screens/home/MainStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainStackParamList } from "../../navigation/types";

import SearchScreen from "./SearchScreen";
import HomeScreen from "./HomeScreen";
import ResultsScreen from "./ResultsScreen";
import AppHeader from "../../components/common/header/AppHeader";
 

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        header: () => <AppHeader isHome={route.name === "Home"} />,
      })}
    >
      <Stack.Screen name="Home" component={HomeScreen} />

      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerShown: true }}
      />

      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ headerShown: true, title: "Risultati" }}
      />

    </Stack.Navigator>
  );
}





