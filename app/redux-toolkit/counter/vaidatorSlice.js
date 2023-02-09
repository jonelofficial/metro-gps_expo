import { createSlice } from "@reduxjs/toolkit";

export const validatorSlice = createSlice({
  name: "validator",
  initialState: {
    value: true,
  },
  reducers: {
    validatorStatus: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { validatorStatus } = validatorSlice.actions;

export default validatorSlice.reducer;
