// src/store/persistConfig.ts
import { OnboardingState } from './slices/onboardingSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistConfig } from 'redux-persist';
import { AuthState } from './slices/authSlice';

export const authPersistConfig: PersistConfig<AuthState> = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['access', 'refresh', 'user', 'isAnonymous'], // salvo anche isAnonymous
};
// Persist config per ONBOARDING
export const onboardingPersistConfig: PersistConfig<OnboardingState> = {
  key: 'onboarding',
  storage: AsyncStorage,
  whitelist: ['completed'], // salvo il flag
};