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
import { useForgotPasswordMutation } from "../../store/api/authApi";
import { mapAuthError } from "../../utils/errorHandler";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading, error, isSuccess }] = useForgotPasswordMutation();
  const theme = useTheme();

  const handleForgot = async () => {
    if (!email) return;
    try {
      // ✅ adesso chiama correttamente /password-reset/
      await forgotPassword({ email }).unwrap();
    } catch (err) {
      console.error("❌ Forgot password failed:", err);
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
              title="Recupero Password"
              titleStyle={{ textAlign: "center", fontSize: 24 }}
            />
          </Appbar.Header>

          <View style={styles.formContainer}>
            {/* Email */}
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />

            {/* Submit */}
            <Button
              mode="contained"
              onPress={handleForgot}
              style={{ marginTop: 20 }}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator animating={true} /> : "Invia link"}
            </Button>

            {/* Messaggi */}
            {error && (
              <Text style={{ color: theme.colors.error, marginTop: 10 }}>
                {mapAuthError(error, "forgotPassword")}
              </Text>
            )}
            {isSuccess && (
              <Text style={{ color: theme.colors.primary, marginTop: 10 }}>
                Email inviata! Controlla la tua casella di posta.
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

