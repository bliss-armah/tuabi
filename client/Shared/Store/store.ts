import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import { authApi } from "@/Features/Authentication/AuthAPI";
import { debtorApi } from "@/Features/Debtors/DebtorsApi";
import { subscriptionApi } from "@/Features/Subscription/SubscriptionAPI";
import { remindersApi } from "@/Features/Reminders/RemindersApi";
import { aiApi } from "@/Features/AI/AIApi";
// import authSlice from "../features/auth/authSlice";

const persistConfig = {
  key: "root",
  version: 1,
  storage: AsyncStorage,
  blacklist: ["auth"],
  // whitelist: ['users'], //these reduce will persist data
};

const reducer = combineReducers({
  //   auth: authSlice,
  [authApi.reducerPath]: authApi.reducer,
  [debtorApi.reducerPath]: debtorApi.reducer,
  [subscriptionApi.reducerPath]: subscriptionApi.reducer,
  [remindersApi.reducerPath]: remindersApi.reducer,
  [aiApi.reducerPath]: aiApi.reducer,
});
const persistedReducer = persistReducer(persistConfig, reducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      authApi.middleware,
      debtorApi.middleware,
      subscriptionApi.middleware,
      remindersApi.middleware,
      aiApi.middleware
    ),
});

setupListeners(store.dispatch);

export default store;
