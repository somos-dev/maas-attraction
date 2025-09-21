import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "react-native-paper"; 
import ServicesScreen from "./ServicesScreen";
import type { ServicesStackParamList } from "../../navigation/types";

const Stack = createNativeStackNavigator<ServicesStackParamList>();

export default function ServicesStack() {
  const theme = useTheme(); // 👈 accedi al tema

  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface, // 👈 testo coerente
      }}
    >
      <Stack.Screen
        name="Services"
        component={ServicesScreen}
        options={{ title: "Servizi" }}
      />
    </Stack.Navigator>
  );
}
