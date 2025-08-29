// src/screens/auth/RegisterScreen.tsx
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrazione</Text>
      <Button title="Vai alla Home" onPress={() => navigation.navigate("Main" as never)} />
      <Button title="Hai già un account? Login" onPress={() => navigation.navigate("Login")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
});
