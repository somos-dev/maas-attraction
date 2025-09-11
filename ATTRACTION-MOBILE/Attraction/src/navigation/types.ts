
// AppNavigator (gestisce l'intero flusso: splash → onboarding → auth/tab)
export type AppNavigatorParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Tab: undefined;
};

// AuthStack (login / registrazione / forgot / reset password)
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword?: { email?: string }; 
  ResetPassword: { token: string } | undefined; // token dal link email
};



// TabNavigator (Tab principale: Home, Linee, Servizi, Profilo)
export type TabNavigatorParamList = {
  HomeTab: undefined;
  LinesTab: undefined;
  ServicesTab: undefined;
  ProfileTab: undefined;
};

export type LinesStackParamList = {
  Lines: undefined;
 
};

export type ServicesStackParamList = {
  Services: undefined;

};

export type ProfileStackParamList = {
  Profile: undefined;
  // EditProfile: undefined;                      // in futuro
};






// MainStack (schermate principali dopo login o accesso ospite)
export type MainStackParamList = {
  Home: undefined;
};


