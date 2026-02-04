import { configureStore } from "@reduxjs/toolkit";
import { ThermostatStoreState } from "../types";
import thermostatReducer from "./thermostatSlice";

export const store = configureStore({
  reducer: thermostatReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Allow Date objects in state for simplicity
    }),
});

export type RootState = ThermostatStoreState;
export type AppDispatch = typeof store.dispatch;

// Typed hooks helpers
export { useAppDispatch, useAppSelector } from "./hooks";
