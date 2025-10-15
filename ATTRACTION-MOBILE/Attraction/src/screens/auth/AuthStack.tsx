// src/screens/auth/AuthStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";

import ForgotPasswordScreen from "./ForgotPasswordScreen";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";

import AppHeader from "../../components/common/header/AppHeader";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack({
  initialRouteName = "Login",
}: {
  initialRouteName?: keyof AuthStackParamList;
}) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={({ route }) => ({
        header: () => <AppHeader isHome={false} />,
      })}
    >
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}





