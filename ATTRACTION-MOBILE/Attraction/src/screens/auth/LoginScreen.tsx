import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppNavigatorParamList } from "../../navigation/types";

type NavProp = NativeStackNavigationProp<AppNavigatorParamList, "Auth">;

export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Button title="Accedi" onPress={() => navigation.navigate("Main")} />
      <Button
        title="Non sono registrato"
        onPress={() => navigation.navigate("Auth", { screen: "Register" })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
});

