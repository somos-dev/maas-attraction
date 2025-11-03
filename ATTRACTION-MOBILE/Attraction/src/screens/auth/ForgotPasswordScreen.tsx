import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import {useForgotPasswordMutation} from '../../store/api/authApi';
import {mapAuthError} from '../../utils/errorHandler';

export default function ForgotPasswordScreen({navigation}: any) {
  const [email, setEmail] = useState('');
  const [forgotPassword, {isLoading, error, isSuccess}] =
    useForgotPasswordMutation();
  const theme = useTheme();

  const handleForgot = async () => {
    if (!email) return;
    try {
      await forgotPassword({email}).unwrap();
    } catch (err) {
      console.error('❌ Forgot password failed:', err);
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
          {/* Titolo e descrizione */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Recupera la tua password</Text>
            <Text style={styles.subtitle}>
              Inserisci l'indirizzo email con cui ti sei registrato. Ti
              invieremo un link per reimpostarla.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email */}
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              mode="outlined"
              outlineStyle={{borderRadius: 12}}
              style={styles.input}
              left={<TextInput.Icon icon="email-outline" />}
            />

            {/* Submit */}
            <Button
              mode="contained"
              onPress={handleForgot}
              style={styles.sendButton}
              contentStyle={{paddingVertical: 8}}
              labelStyle={{fontSize: 16, fontWeight: '600'}}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator animating={true} color="white" />
              ) : (
                'Invia link di reset'
              )}
            </Button>

            {/* Messaggi */}
            {error && (
              <Text style={styles.errorText}>
                {mapAuthError(error, 'forgotPassword')}
              </Text>
            )}
            {isSuccess && (
              <Text style={styles.successText}>
                ✅ Email inviata! Controlla la tua casella di posta.
              </Text>
            )}

            {/* Link */}
            <View style={styles.linkContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.linkText, {color: theme.colors.primary}]}>
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
    marginTop: 60,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
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
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  sendButton: {
    marginTop: 10,
    borderRadius: 10,
    elevation: 2,
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  successText: {
    color: 'green',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
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
