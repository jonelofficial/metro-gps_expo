import { createSlice } from "@reduxjs/toolkit";

export const companionSlice = createSlice({
  name: "companion",
  initialState: {
    value: [],
  },
  reducers: {
    setCompanion: (state, action) => {
      state.value = [
        ...state.value,
        { first_name: action.payload?.first_name },
      ];
    },
    removeCompanion: (state) => {
      state.value = [];
    },
    spliceCompanion: (state, action) => {
      state.value.splice(action.payload, 1);
    },
  },
});

export const { setCompanion, removeCompanion, spliceCompanion } =
  companionSlice.actions;

export default companionSlice.reducer;
