import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  token: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    addAuthToken: (
      state,
      action: PayloadAction<{
        token: string;
      }>,
    ) => {
      localStorage.setItem("authToken", action.payload.token);
      state.token = action.payload.token;
    },
    removeAuthToken: (state) => {
      localStorage.clear();
      state.token = "";
    },
  },
});

export const { addAuthToken, removeAuthToken } = authSlice.actions;
export default authSlice.reducer;
