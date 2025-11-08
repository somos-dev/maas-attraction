import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/types';
import {useRegisterMutation} from '../../store/api/authApi';
import {useDispatch} from 'react-redux';
import {setAnonymous} from '../../store/slices/authSlice';
import {
  TextInput,
  Button,
  useTheme,
  Menu,
  ActivityIndicator,
} from 'react-native-paper';
import {mapAuthError} from '../../utils/errorHandler';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({navigation}: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [codiceFiscale, setCodiceFiscale] = useState('');
  const [userType, setUserType] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [codiceFiscaleError, setCodiceFiscaleError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const [register, {isLoading, error}] = useRegisterMutation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const {width, height} = useWindowDimensions();
  const [orientation, setOrientation] = useState('P');

  useEffect(() => {
    setOrientation(width > height ? 'L' : 'P');
  }, [width, height]);

  // --- VALIDAZIONI ---
  const validatePassword = (value: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (!value) return 'Password obbligatoria';
    if (value.length < minLength) return `Almeno ${minLength} caratteri`;
    if (!hasUpperCase) return 'Serve una maiuscola';
    if (!hasLowerCase) return 'Serve una minuscola';
    if (!hasNumber) return 'Serve un numero';
    if (!hasSpecialChar) return 'Serve un carattere speciale';
    return '';
  };

  const validateConfirmPassword = (pass: string, confirm: string) => {
    if (!confirm) return 'Conferma obbligatoria';
    if (pass !== confirm) return 'Le password non coincidono';
    return '';
  };

  const validateCodiceFiscale = (cf: string) => {
    if (!cf) return '';
    if (cf.length !== 16) return 'Il codice fiscale deve avere 16 caratteri';
    return '';
  };

  const validateUsername = (value: string) => {
    const pattern = /^[\w.@+-]+$/;
    const trimmed = value.trim();
    if (!trimmed) return 'Username obbligatorio';
    if (trimmed.length > 150) return 'Massimo 150 caratteri';
    if (trimmed.length < 3) return 'Minimo 3 caratteri';
    if (!pattern.test(trimmed)) return 'Caratteri non validi';
    return '';
  };

  const validateEmail = (value: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'Email obbligatoria';
    if (value.length > 254) return 'Massimo 254 caratteri';
    if (!emailPattern.test(value)) return 'Email non valida';
    return '';
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
      const res = await register({
        username: username.trim(),
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
        codice_fiscale: codiceFiscale || undefined,
        type: userType || undefined,
      }).unwrap();

      console.log('✅ Registrazione:', res?.message);
      navigation.navigate('Login');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: theme.colors.background}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Logo o Titolo */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Crea un nuovo account</Text>
            <Text style={styles.subtitle}>Compila i campi per registrarti</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Username */}
            <TextInput
              label="Username"
              value={username}
              onChangeText={text => {
                setUsername(text);
                setUsernameError(validateUsername(text));
              }}
              mode="outlined"
              outlineStyle={{borderRadius: 12}}
              style={styles.input}
              left={<TextInput.Icon icon="account-outline" />}
            />
            {usernameError && (
              <Text style={styles.errorText}>{usernameError}</Text>
            )}

            {/* Email */}
            <TextInput
              label="Email"
              value={email}
              onChangeText={text => {
                setEmail(text);
                setEmailError(validateEmail(text));
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              mode="outlined"
              outlineStyle={{borderRadius: 12}}
              style={styles.input}
              left={<TextInput.Icon icon="email-outline" />}
            />
            {emailError && <Text style={styles.errorText}>{emailError}</Text>}

            {/* Codice Fiscale */}
            {/* <TextInput
              label="Codice Fiscale (opzionale)"
              value={codiceFiscale}
              onChangeText={text => {
                setCodiceFiscale(text.toUpperCase());
                setCodiceFiscaleError(validateCodiceFiscale(text));
              }}
              mode="outlined"
              outlineStyle={{borderRadius: 12}}
              style={styles.input}
              left={<TextInput.Icon icon="card-account-details-outline" />}
              maxLength={16}
            />
            {codiceFiscaleError && (
              <Text style={styles.errorText}>{codiceFiscaleError}</Text>
            )} */}

            {/* Tipo utente */}
            {/* <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                  <TextInput
                    label="Tipo utente"
                    value={
                      userType === 'student'
                        ? 'Studente'
                        : userType === 'worker'
                        ? 'Lavoratore'
                        : userType === 'other'
                        ? 'Altro'
                        : ''
                    }
                    editable={false}
                    mode="outlined"
                    outlineStyle={{borderRadius: 12}}
                    style={styles.input}
                    left={<TextInput.Icon icon="account-group-outline" />}
                  />
                </TouchableOpacity>
              }>
              <Menu.Item
                onPress={() => {
                  setUserType('student');
                  setMenuVisible(false);
                }}
                title="Studente"
              />
              <Menu.Item
                onPress={() => {
                  setUserType('worker');
                  setMenuVisible(false);
                }}
                title="Lavoratore"
              />
              <Menu.Item
                onPress={() => {
                  setUserType('other');
                  setMenuVisible(false);
                }}
                title="Altro"
              />
            </Menu> */}

            {/* Password */}
            <TextInput
              label="Password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                setPasswordError(validatePassword(text));
              }}
              secureTextEntry={!showPassword}
              mode="outlined"
              outlineStyle={{borderRadius: 12}}
              style={styles.input}
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
            {passwordError && (
              <Text style={styles.errorText}>{passwordError}</Text>
            )}

            {/* Conferma Password */}
            <TextInput
              label="Conferma Password"
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                setConfirmError(validateConfirmPassword(password, text));
              }}
              secureTextEntry={!showPassword}
              mode="outlined"
              outlineStyle={{borderRadius: 12}}
              style={styles.input}
              left={<TextInput.Icon icon="lock-check-outline" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
            {confirmError && (
              <Text style={styles.errorText}>{confirmError}</Text>
            )}

            {/* Bottone Registrazione */}
            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.registerButton}
              contentStyle={{paddingVertical: 8}}
              labelStyle={{fontSize: 16, fontWeight: '600'}}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator animating={true} color="white" />
              ) : (
                'Registrati'
              )}
            </Button>

            {error && (
              <Text style={styles.errorText}>
                {mapAuthError(error, 'register')}
              </Text>
            )}

            {/* Link Login */}
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.linkText, {color: theme.colors.primary}]}>
                Hai già un account? Accedi
              </Text>
            </TouchableOpacity>

            {/* Accesso ospite */}
            <TouchableOpacity onPress={() => dispatch(setAnonymous())}>
              <Text style={[styles.linkText, {color: theme.colors.secondary}]}>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  formContainer: {
    width: '90%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  input: {
    marginBottom: 14,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  registerButton: {
    marginTop: 10,
    borderRadius: 10,
    elevation: 2,
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
  },
  linkText: {
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});
