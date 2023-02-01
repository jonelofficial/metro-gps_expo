import { createSlice } from "@reduxjs/toolkit";

export const snackbarSlice = createSlice({
  name: "snackbar",
  initialState: {
    value: {
      msg: "",
      color: "danger",
      visible: false,
    },
  },
  reducers: {
    setMsg: (state, action) => {
      state.value.msg = action.payload;
    },
    setColor: (state, action) => {
      state.value.color = action.payload;
    },
    setVisible: (state, action) => {
      state.value.visible = action.payload;
    },
  },
});

export const { setColor, setMsg, setVisible } = snackbarSlice.actions;

export default snackbarSlice.reducer;
