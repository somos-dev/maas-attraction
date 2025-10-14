import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useDispatch } from "react-redux";
import { clearAuth } from "../../store/slices/authSlice";
import AppButton from "./button/AppButton"; // 👈 import del tuo bottone personalizzato

export default function RestrictedAccess({
  message = "Per accedere a questa sezione è necessario effettuare l'accesso o registrarti.",
}) {
  const theme = useTheme();
  const dispatch = useDispatch();

  const handleAccess = () => {
    // Effettua logout → AppNavigator rimonta AuthStack
    dispatch(clearAuth());
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text
        variant="titleLarge"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        Accesso riservato
      </Text>

      <Text
        variant="bodyMedium"
        style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
      >
        {message}
      </Text>

      <AppButton
        label="Accedi"
        onPress={handleAccess}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  message: {
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    width: "60%",
    alignSelf: "center",
    borderRadius: 30,
  },
});

