// src/screens/main/MainStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainStackParamList } from "../../navigation/types";

import HomeScreen from "./HomeScreen";

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}


