import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { metroApi } from "../api/metroApi";
import tokenReducer from "../redux-toolkit/counter/userCounter";
export const store = configureStore({
  reducer: {
    token: tokenReducer,
    [metroApi.reducerPath]: metroApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(metroApi.middleware),
});
