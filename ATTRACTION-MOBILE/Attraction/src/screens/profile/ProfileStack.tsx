import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "react-native-paper"; // 👈 aggiunto
import ProfileScreen from "./ProfileScreen";
import type { ProfileStackParamList } from "../../navigation/types";
import EditProfileScreen from "./EditProfileScreen";
import TransportPreferencesScreen from "./TransportPreferencesScreen";
import TripsHistoryScreen from "./TripsHistoryScreen";


const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  const theme = useTheme(); 

  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface, 
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

      <Stack.Screen
        name="TransportPreferences"
        component={TransportPreferencesScreen}
        options={{ title: "Preferenze di Trasporto" }}
      />

      <Stack.Screen
        name="TripsHistory"
        component={TripsHistoryScreen}
        options={{ title: "Storico Viaggi" }}
      />
    </Stack.Navigator>
  );
}

