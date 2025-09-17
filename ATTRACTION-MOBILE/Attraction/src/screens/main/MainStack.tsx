// src/screens/home/MainStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainStackParamList } from "../../navigation/types";

import SearchScreen from "./SearchScreen";
import HomeScreen from "./HomeScreen";
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
    </Stack.Navigator>
  );
}





