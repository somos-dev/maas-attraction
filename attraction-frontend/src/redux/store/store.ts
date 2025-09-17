import { configureStore } from '@reduxjs/toolkit'
import { savedApi } from '../services/savedApi'
import { tripHistoryApi } from '../services/tripHistoryApi'

export const store = configureStore({
  reducer: {
    [savedApi.reducerPath]: savedApi.reducer,
    [tripHistoryApi.reducerPath]: tripHistoryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(savedApi.middleware)
      .concat(tripHistoryApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
