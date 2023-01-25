import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../redux-toolkit/counter/counterSlice";
import tokenReducer from "../redux-toolkit/counter/userCounter";

export const store = configureStore({
  reducer: { counter: counterReducer, token: tokenReducer },
});
