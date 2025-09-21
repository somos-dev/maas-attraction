import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "react-native-paper"; // 👈 aggiunto
import ProfileScreen from "./ProfileScreen";
import type { ProfileStackParamList } from "../../navigation/types";
import EditProfileScreen from "./EditProfileScreen";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
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
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profilo" }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Modifica Profilo" }}
      />
    </Stack.Navigator>
  );
}

