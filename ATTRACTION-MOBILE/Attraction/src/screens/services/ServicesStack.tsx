import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ServicesScreen from "./ServicesScreen";
import type { ServicesStackParamList } from "../../navigation/types";

const Stack = createNativeStackNavigator<ServicesStackParamList>();

export default function ServicesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen name="Services" component={ServicesScreen} options={{ title: "Servizi" }} />
    </Stack.Navigator>
  );
}
