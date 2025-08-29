// src/navigation/types.ts

// AppNavigator (gestisce l'intero flusso: splash → onboarding → auth/main)
export type AppNavigatorParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

// AuthStack (login / registrazione / reset password ecc.)
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword?: { email?: string }; // opzionale, per estensioni future
};

// MainStack (schermate principali dopo login o accesso ospite)
export type MainStackParamList = {
  Home: undefined;
  // aggiungeremo Search, TripPlanner, ecc. nei prossimi step
};

