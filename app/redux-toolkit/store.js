import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { metroApi } from "../api/metroApi";
import tokenReducer from "../redux-toolkit/counter/userCounter";
import netReducer from "../redux-toolkit/counter/netSlice";
import imageReducer from "../redux-toolkit/counter/imageSlice";
import companionReducer from "../redux-toolkit/counter/companionSlice";
import snackbarReducer from "./counter/snackbarSlice";
import validatorReducer from "./counter/vaidatorSlice";

// middleware: (getDefaultMiddleware) =>
// getDefaultMiddleware().concat(metroApi.middleware),

const middleware = [
  ...getDefaultMiddleware({
    // serializableCheck: false, // Disable serializability check
    // immutableCheck: false,
  }),
  metroApi.middleware, // Add the metroApi middleware
];

export const store = configureStore({
  reducer: {
    token: tokenReducer,
    net: netReducer,
    image: imageReducer,
    companion: companionReducer,
    snackbar: snackbarReducer,
    validator: validatorReducer,
    [metroApi.reducerPath]: metroApi.reducer,
  },
  middleware,
});
