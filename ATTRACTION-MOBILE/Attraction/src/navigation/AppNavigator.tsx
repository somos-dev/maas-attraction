import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useTheme } from "react-native-paper"; 
import { AppNavigatorParamList } from "./types";
import SplashScreen from "../screens/splash/SplashScreen";
import OnboardingScreen from "../screens/splash/OnboardingScreen";
import AuthStack from "../screens/auth/AuthStack";
import DrawerNavigator from "./DrawerNavigator";

const Stack = createNativeStackNavigator<AppNavigatorParamList>();

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme(); 
  const auth = useSelector((state: RootState) => state.auth);
  const onboarding = useSelector((state: RootState) => state.onboarding);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  const isAuthenticated = !!auth.access;
  const isAnonymous = auth.isAnonymous;
  const hasSeenOnboarding = onboarding.completed;
  const startScreen = onboarding.authStartScreen || "Login";

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Onboarding non ancora visto */}
        {!hasSeenOnboarding && (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )}

        {/* Utente loggato o ospite */}
        {hasSeenOnboarding && (isAuthenticated || isAnonymous) && (
          <Stack.Screen name="Tab" component={DrawerNavigator} />
        )}

        {/* Flusso autenticazione (Login o Register) */}
        {hasSeenOnboarding && !isAuthenticated && !isAnonymous && (
          <Stack.Screen name="Auth">
            {() => <AuthStack initialRouteName={startScreen} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


