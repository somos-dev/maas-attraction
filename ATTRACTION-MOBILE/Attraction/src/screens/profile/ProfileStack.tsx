import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "./ProfileScreen";
import type { ProfileStackParamList } from "../../navigation/types";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profilo" }} />
    </Stack.Navigator>
  );
}
