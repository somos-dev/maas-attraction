// src/store/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import { authApi } from './api/authApi';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import { authPersistConfig } from './persistConfig';

import onboardingReducer from './slices/onboardingSlice';
import { onboardingPersistConfig } from './persistConfig';

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  auth: persistReducer(authPersistConfig, authReducer),
  user: userReducer,
  onboarding: persistReducer(onboardingPersistConfig, onboardingReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }).concat(authApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
