
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../store/api/authApi";
import { setCredentials } from "../../store/slices/authSlice";
import { setUser } from "../../store/slices/userSlice"; // 👈 aggiunto
import {
  TextInput,
  Button,
  Appbar,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { mapAuthError } from "../../utils/errorHandler";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const [orientation, setOrientation] = useState("P");

  useEffect(() => {
    setOrientation(width > height ? "L" : "P");
  }, [width, height]);

  const handleLogin = async () => {
    try {
      const result = await login({ email, password }).unwrap();

      dispatch(
        setCredentials({
          access: result.access,
          refresh: result.refresh,
          user: result.user,
        })
      );

      // 👇 nuova parte: salva anche i dati utente nello userSlice
      if (result.user) {
        dispatch(setUser(result.user));
      }

      navigation.replace("Main");
    } catch (err) {
      console.error("❌ Login failed:", err);
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
              title="Login"
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

            {/* Password */}
            <TextInput
              label="Password"
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

            {/* Login */}
            <Button
              mode="contained"
              onPress={handleLogin}
              style={{ marginTop: 20 }}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator animating={true} /> : "Accedi"}
            </Button>

            {/* Errori API */}
            {error && (
              <Text style={{ color: theme.colors.error, marginTop: 10 }}>
                {mapAuthError(error, "login")}
              </Text>
            )}

            {/* Link extra */}
            <View style={styles.linkContainer}>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                  Non hai un account? Registrati
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                  Password dimenticata?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Main")}>
                <Text style={[styles.linkText, { color: theme.colors.secondary }]}>
                  Salta (Accedi come ospite)
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  formContainer: {
    width: "90%",
    maxWidth: 400,
    alignSelf: "center",
  },
  input: {
    marginBottom: 10,
  },
  linkContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  linkText: {
    textDecorationLine: "underline",
    textAlign: "center",
    marginVertical: 6,
  },
});
