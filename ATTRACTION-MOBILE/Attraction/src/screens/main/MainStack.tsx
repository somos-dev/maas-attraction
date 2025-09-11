import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainStackParamList } from "../../navigation/types";

import HomeScreen from "./HomeScreen";
import AppHeader from "../../components/common/header/AppHeader";
import { SCREEN_TITLES } from "../../navigation/screenTitles";

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        header: () => (
          <AppHeader
            title={SCREEN_TITLES[route.name] || route.name}
            isHome={route.name === "Home"}
          />
        ),
      })}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}




