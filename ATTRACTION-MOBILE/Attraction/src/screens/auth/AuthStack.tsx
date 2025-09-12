import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";

import ForgotPasswordScreen from "./ForgotPasswordScreen";
import ResetPasswordScreen from "./ResetPasswordScreen";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack({ initialRouteName = "Login" }: { initialRouteName?: keyof AuthStackParamList }) {
  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}




