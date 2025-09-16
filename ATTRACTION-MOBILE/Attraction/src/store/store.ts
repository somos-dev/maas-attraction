// src/store/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import { authApi } from './api/authApi';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import { authPersistConfig } from './persistConfig';
import { userApi } from './api/userApi';
import onboardingReducer from './slices/onboardingSlice';
import { onboardingPersistConfig } from './persistConfig';
import { searchApi } from './api/searchApi';
import { placesApi } from './api/placesApi';

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [searchApi.reducerPath]: searchApi.reducer,
  [placesApi.reducerPath]: placesApi.reducer,
  auth: persistReducer(authPersistConfig, authReducer),
  user: userReducer,
  search: searchApi.reducer,
  places: placesApi.reducer,
  onboarding: persistReducer(onboardingPersistConfig, onboardingReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }).concat(
      authApi.middleware,
      userApi.middleware,
      searchApi.middleware,
      placesApi.middleware,
    ),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
