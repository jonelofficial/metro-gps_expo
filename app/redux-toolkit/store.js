import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { metroApi } from "../api/metroApi";
import counterReducer from "../redux-toolkit/counter/counterSlice";
import tokenReducer from "../redux-toolkit/counter/userCounter";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    token: tokenReducer,
    [metroApi.reducerPath]: metroApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(metroApi.middleware),
});
