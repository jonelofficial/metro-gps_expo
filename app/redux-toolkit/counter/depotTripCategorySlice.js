import { createSlice } from "@reduxjs/toolkit";

export const depotTripCategorySlice = createSlice({
  name: "depotTripCategory",
  initialState: {
    value: "hauling",
  },
  reducers: {
    setDepotTripCateogry: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setDepotTripCateogry } = depotTripCategorySlice.actions;

export default depotTripCategorySlice.reducer;
