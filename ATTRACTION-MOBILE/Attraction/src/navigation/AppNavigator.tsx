// src/navigation/AppNavigator.tsx
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppNavigatorParamList } from "./types";
import SplashScreen from "../screens/splash/SplashScreen";
import OnboardingScreen from "../screens/splash/OnboardingScreen";
import AuthStack from "../screens/auth/AuthStack";
import DrawerNavigator from "./DrawerNavigator";


const Stack = createNativeStackNavigator<AppNavigatorParamList>();

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000); // Splash 2 sec
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="Tab" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

