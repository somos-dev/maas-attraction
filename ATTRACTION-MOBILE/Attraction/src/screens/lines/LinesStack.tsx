import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "react-native-paper"; // 👈 aggiunto
import LinesScreen from "./LinesScreen";
import type { LinesStackParamList } from "../../navigation/types";

const Stack = createNativeStackNavigator<LinesStackParamList>();

export default function LinesStack() {
  const theme = useTheme(); // 👈 accedi al tema

  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.colors.surface }, // 👈 sfondo coerente
        headerTintColor: theme.colors.onSurface, // 👈 testo coerente
      }}
    >
      <Stack.Screen
        name="Lines"
        component={LinesScreen}
        options={{ title: "Linee" }}
      />
    </Stack.Navigator>
  );
}
