import { createSlice } from "@reduxjs/toolkit";

export const imageSlice = createSlice({
  name: "image",
  initialState: {
    value: null,
  },
  reducers: {
    setImage: (state, action) => {
      state.value = action.payload;
    },
    removeImage: (state) => {
      state.value = null;
    },
  },
});

export const { setImage, removeImage } = imageSlice.actions;

export default imageSlice.reducer;
