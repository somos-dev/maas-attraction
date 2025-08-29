// src/screens/splash/OnboardingScreen.tsx
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppNavigatorParamList } from "../../navigation/types";

type NavProp = NativeStackNavigationProp<AppNavigatorParamList, "Onboarding">;

export default function OnboardingScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Benvenuto in ATTRACTION OnBoarding</Text>
      <Button title="Accedi" onPress={() => navigation.navigate("Auth", { screen: "Login" })} />
      <Button title="Registrati" onPress={() => navigation.navigate("Auth", { screen: "Register" })} />
      <Button title="Salta (ospite)" onPress={() => navigation.navigate("Main")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
});




