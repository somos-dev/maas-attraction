
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
  EditProfile: undefined;
  TransportPreferences: undefined;
};



// MainStack (schermate principali dopo login o accesso ospite)
export type MainStackParamList = {
  Home: undefined;
  Search: undefined;
  Results: { searchId: number } | undefined; // id della ricerca salvata

};

// DrawerNavigator (menu laterale)
export type DrawerParamList = {
  TabsRoot: undefined;  // nasconde le Tab nel drawer
  Settings: undefined;
  Feedback: undefined;  
};
