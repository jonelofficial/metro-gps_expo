import { createSlice } from "@reduxjs/toolkit";

export const netSlice = createSlice({
  name: "net",
  initialState: {
    value: true,
  },
  reducers: {
    netStatus: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { netStatus } = netSlice.actions;

export default netSlice.reducer;
