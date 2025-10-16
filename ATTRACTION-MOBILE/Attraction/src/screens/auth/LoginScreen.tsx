import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  Image,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {useLoginMutation} from '../../store/api/authApi';
import {setCredentials, setAnonymous} from '../../store/slices/authSlice';
import {setUser, clearUser} from '../../store/slices/userSlice';
import {userApi} from '../../store/api/userApi';
import {
  TextInput,
  Button,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import {mapAuthError} from '../../utils/errorHandler';

export default function LoginScreen({navigation}: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [orientation, setOrientation] = useState('P');

  const [login, {isLoading, error}] = useLoginMutation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const {width, height} = useWindowDimensions();

  useEffect(() => {
    setOrientation(width > height ? 'L' : 'P');
  }, [width, height]);

  const handleLogin = async () => {
    try {
      const {access, refresh} = await login({
        email: email.trim(),
        password,
      }).unwrap();

      dispatch(setCredentials({access, refresh}));

      const profile = await dispatch(
        userApi.endpoints.getProfile.initiate(),
      ).unwrap();

      dispatch(setUser(profile));
    } catch (err) {
      console.error('❌ Login failed:', err);
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
          {/* Logo centrale */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo/Attraction.scritta.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              mode="outlined" // 👈 usa il bordo outline (più elegante)
              outlineStyle={{borderRadius: 12}} // 👈 bordi morbidi
              style={styles.input}
              left={<TextInput.Icon icon="email-outline" />}
              theme={{
                roundness: 12,
                colors: {
                  background: '#fff',
                  primary: theme.colors.primary,
                  text: '#333',
                  placeholder: '#aaa',
                },
              }}
            />

            <TextInput
              label="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
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
              theme={{
                roundness: 12,
                colors: {
                  background: '#fff',
                  primary: theme.colors.primary,
                  text: '#333',
                  placeholder: '#aaa',
                },
              }}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              contentStyle={{paddingVertical: 8}}
              labelStyle={{fontSize: 16, fontWeight: '600'}}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator animating={true} color="white" />
              ) : (
                'Accedi'
              )}
            </Button>

            {error && (
              <Text style={styles.errorText}>
                {mapAuthError(error, 'login')}
              </Text>
            )}

            <View style={styles.linkContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.linkText, {color: theme.colors.primary}]}>
                  Non hai un account? Registrati
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={[styles.linkText, {color: theme.colors.primary}]}>
                  Password dimenticata?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  dispatch(setAnonymous());
                  dispatch(clearUser());
                }}>
                <Text
                  style={[styles.linkText, {color: theme.colors.secondary}]}>
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
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 60,
  },
  logo: {
    width: 300, // ← ingrandito
    height: 120,
  },
  formContainer: {
    width: '90%',
    maxWidth: 400,
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
    backgroundColor: 'white',
    fontSize: 16,
  },
  loginButton: {
    marginTop: 10,
    borderRadius: 10,
    elevation: 2,
  },
  errorText: {
    color: 'red',
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  linkContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  linkText: {
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginVertical: 6,
    fontSize: 14,
  },
});
