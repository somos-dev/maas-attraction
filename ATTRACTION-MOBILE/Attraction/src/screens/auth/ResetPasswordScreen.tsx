import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button, Appbar, ActivityIndicator, useTheme } from "react-native-paper";
import { useResetPasswordMutation } from "../../store/api/authApi";
import { mapAuthError } from "../../utils/errorHandler";

export default function ResetPasswordScreen({ navigation, route }: any) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetPassword, { isLoading, error, isSuccess }] = useResetPasswordMutation();
  const theme = useTheme();

  // prendo uidb64 e token dai parametri
  const uidb64 = route.params?.uidb64;
  const token = route.params?.token;

  const handleReset = async () => {
    if (password !== confirm) return;
    try {
      await resetPassword({ uidb64, token, password }).unwrap();
      navigation.replace("Login");
    } catch (err) {
      console.error("❌ Reset password failed:", err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.container}>
          {/* Header */}
          <Appbar.Header style={{ backgroundColor: "transparent", elevation: 0 }}>
            <Appbar.Content
              title="Reset Password"
              titleStyle={{ textAlign: "center", fontSize: 24 }}
            />
          </Appbar.Header>

          <View style={styles.formContainer}>
            {/* Password */}
            <TextInput
              label="Nuova password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            {/* Conferma */}
            <TextInput
              label="Conferma password"
              secureTextEntry={!showPassword}
              value={confirm}
              onChangeText={setConfirm}
              style={styles.input}
              left={<TextInput.Icon icon="lock-check" />}
            />

            {/* Submit */}
            <Button
              mode="contained"
              onPress={handleReset}
              style={{ marginTop: 20 }}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator animating={true} /> : "Conferma"}
            </Button>

            {/* Messaggi */}
            {error && (
              <Text style={{ color: theme.colors.error, marginTop: 10 }}>
                {mapAuthError(error, "resetPassword")}
              </Text>
            )}
            {isSuccess && (
              <Text style={{ color: theme.colors.primary, marginTop: 10 }}>
                Password aggiornata con successo!
              </Text>
            )}

            {/* Link */}
            <View style={styles.linkContainer}>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                  Torna al login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: "center" },
  container: { flex: 1, justifyContent: "center" },
  formContainer: { width: "90%", maxWidth: 400, alignSelf: "center" },
  input: { marginBottom: 10 },
  linkContainer: { marginTop: 30, alignItems: "center" },
  linkText: { textDecorationLine: "underline", textAlign: "center", marginVertical: 6 },
});


