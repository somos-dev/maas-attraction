import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import { useRegisterMutation } from "../../store/api/authApi";
import { useDispatch } from "react-redux";
import { setCredentials, setAnonymous } from "../../store/slices/authSlice"; // 👈 include setAnonymous
import { setUser } from "../../store/slices/userSlice";
import {
  TextInput,
  Button,
  useTheme,
  Appbar,
  Menu,
  ActivityIndicator,
} from "react-native-paper";
import { mapAuthError } from "../../utils/errorHandler";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [codiceFiscale, setCodiceFiscale] = useState("");
  const [userType, setUserType] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [codiceFiscaleError, setCodiceFiscaleError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const [register, { isLoading, error }] = useRegisterMutation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const [orientation, setOrientation] = useState("P");

  useEffect(() => {
    setOrientation(width > height ? "L" : "P");
  }, [width, height]);

  // VALIDAZIONI
  const validatePassword = (value: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (!value) return "Password obbligatoria";
    if (value.length < minLength) return `Almeno ${minLength} caratteri`;
    if (!hasUpperCase) return "Serve una maiuscola";
    if (!hasLowerCase) return "Serve una minuscola";
    if (!hasNumber) return "Serve un numero";
    if (!hasSpecialChar) return "Serve un carattere speciale";
    return "";
  };

  const validateConfirmPassword = (pass: string, confirm: string) => {
    if (!confirm) return "Conferma obbligatoria";
    if (pass !== confirm) return "Le password non coincidono";
    return "";
  };

  const validateCodiceFiscale = (cf: string) => {
    if (!cf) return "";
    if (cf.length !== 16) return "Codice fiscale deve avere 16 caratteri";
    return "";
  };

  const validateUsername = (value: string) => {
    const pattern = /^[\w.@+-]+$/;
    const trimmed = value.trim();
    if (!trimmed) return "Username obbligatorio";
    if (trimmed.length > 150) return "Massimo 150 caratteri";
    if (trimmed.length < 3) return "Minimo 3 caratteri";
    if (!pattern.test(trimmed)) return "Caratteri non validi";
    return "";
  };

  const validateEmail = (value: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return "Email obbligatoria";
    if (value.length > 254) return "Massimo 254 caratteri";
    if (!emailPattern.test(value)) return "Email non valida";
    return "";
  };

  const handleRegister = async () => {
    if (
      usernameError ||
      emailError ||
      passwordError ||
      confirmError ||
      codiceFiscaleError
    ) {
      return;
    }

    try {
      const result = await register({
        username: username.trim(),
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
        codice_fiscale: codiceFiscale || undefined,
        type: userType || undefined,
      }).unwrap();

      dispatch(
        setCredentials({
          access: result.access,
          refresh: result.refresh,
          user: result.user,
        })
      );

      if (result.user) {
        dispatch(setUser(result.user));
      }

    } catch (err) {
      console.error("Registration failed:", err);
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
          <Appbar.Header
            style={{ backgroundColor: "transparent", elevation: 0 }}
          >
            <Appbar.Content
              title="Registrazione"
              titleStyle={{ textAlign: "center", fontSize: 24 }}
            />
          </Appbar.Header>

          <View style={styles.formContainer}>
            {/* Username */}
            <TextInput
              label="Username"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setUsernameError(validateUsername(text));
              }}
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />
            {usernameError && <Text style={styles.errorText}>{usernameError}</Text>}

            {/* Email */}
            <TextInput
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError(validateEmail(text));
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />
            {emailError && <Text style={styles.errorText}>{emailError}</Text>}

            {/* Codice Fiscale */}
            <TextInput
              label="Codice Fiscale (opzionale)"
              value={codiceFiscale}
              onChangeText={(text) => {
                setCodiceFiscale(text.toUpperCase());
                setCodiceFiscaleError(validateCodiceFiscale(text));
              }}
              style={styles.input}
              left={<TextInput.Icon icon="card-account-details" />}
              maxLength={16}
            />
            {codiceFiscaleError && (
              <Text style={styles.errorText}>{codiceFiscaleError}</Text>
            )}

            {/* Tipo utente */}
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                  <TextInput
                    label="Tipo utente"
                    value={
                      userType === "student"
                        ? "Studente"
                        : userType === "worker"
                        ? "Lavoratore"
                        : userType === "other"
                        ? "Altro"
                        : ""
                    }
                    style={styles.input}
                    editable={false}
                    left={<TextInput.Icon icon="account-group" />}
                  />
                </TouchableOpacity>
              }
            >
              <Menu.Item
                onPress={() => {
                  setUserType("student");
                  setMenuVisible(false);
                }}
                title="Studente"
              />
              <Menu.Item
                onPress={() => {
                  setUserType("worker");
                  setMenuVisible(false);
                }}
                title="Lavoratore"
              />
              <Menu.Item
                onPress={() => {
                  setUserType("other");
                  setMenuVisible(false);
                }}
                title="Altro"
              />
            </Menu>

            {/* Password */}
            <TextInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError(validatePassword(text));
              }}
              secureTextEntry={!showPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
            {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

            {/* Conferma Password */}
            <TextInput
              label="Conferma Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setConfirmError(validateConfirmPassword(password, text));
              }}
              secureTextEntry={!showPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
            {confirmError && <Text style={styles.errorText}>{confirmError}</Text>}

            {/* Bottone Registrazione */}
            <Button
              mode="contained"
              onPress={handleRegister}
              style={{ marginTop: 20 }}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator animating={true} /> : "Registrati"}
            </Button>

            {error && (
              <Text style={{ color: theme.colors.error, marginTop: 10 }}>
                {mapAuthError(error, "register")}
              </Text>
            )}

            {/* Link Login */}
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text
                style={{
                  marginTop: 20,
                  textAlign: "center",
                  color: theme.colors.primary,
                }}
              >
                Hai già un account? Login
              </Text>
            </TouchableOpacity>

            {/* Accesso ospite */}
            <TouchableOpacity onPress={() => dispatch(setAnonymous())}>
              <Text
                style={{
                  marginTop: 15,
                  textAlign: "center",
                  color: theme.colors.secondary,
                }}
              >
                Salta (Accedi come ospite)
              </Text>
            </TouchableOpacity>
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
  errorText: { color: "red", fontSize: 12, marginBottom: 10, marginLeft: 4 },
});

