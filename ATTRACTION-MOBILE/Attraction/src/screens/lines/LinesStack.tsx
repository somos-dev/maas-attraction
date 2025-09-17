import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LinesScreen from "./LinesScreen";
import type { LinesStackParamList } from "../../navigation/types";

const Stack = createNativeStackNavigator<LinesStackParamList>();

export default function LinesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen name="Lines" component={LinesScreen} options={{ title: "Linee" }} />
    </Stack.Navigator>
  );
}
