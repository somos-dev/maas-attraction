// src/store/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';

// API
import { authApi } from './api/authApi';
import { userApi } from './api/userApi';
import { searchApi } from './api/searchApi';
import { placesApi } from './api/placesApi';
import { stopsApi } from './api/stopsApi';
import { planTripApi } from './api/planTripApi';

// Reducer slices
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import onboardingReducer from './slices/onboardingSlice';

// Persist config
import { authPersistConfig, onboardingPersistConfig } from './persistConfig';

const rootReducer = combineReducers({
  // RTK Query APIs
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [searchApi.reducerPath]: searchApi.reducer,
  [placesApi.reducerPath]: placesApi.reducer,
  [stopsApi.reducerPath]: stopsApi.reducer,
  [planTripApi.reducerPath]: planTripApi.reducer,

  // Redux slices
  auth: persistReducer(authPersistConfig, authReducer),
  user: userReducer,
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
      stopsApi.middleware,
      planTripApi.middleware,
    ),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

