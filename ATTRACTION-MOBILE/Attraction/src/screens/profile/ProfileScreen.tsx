import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Button, Text } from "react-native-paper";
import { useDispatch } from "react-redux";
import { clearAuth } from "../../store/slices/authSlice";
import { useLogoutMutation } from "../../store/api/authApi";

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const [logoutApi, { isLoading }] = useLogoutMutation();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      try {
        await logoutApi(undefined).unwrap();
      } catch {
        // ok se fallisce: logout lato client è sufficiente
      }
      dispatch(clearAuth()); // 👈 pulisce Redux + persist, AppNavigator fa il redirect
    } catch (e: any) {
      Alert.alert("Errore", e?.message ?? "Impossibile completare il logout.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Profilo</Text>
      {isLoading || busy ? (
        <ActivityIndicator />
      ) : (
        <Button mode="contained" onPress={handleLogout} style={styles.logoutButton}>
          Logout
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { marginBottom: 24 },
  logoutButton: { backgroundColor: "#FF5252", borderRadius: 10, paddingHorizontal: 16 },
});
