import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  token: "",
  role: "",
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
    addUserRole: (
      state,
      action: PayloadAction<{
        role: string;
      }>,
    ) => {
      localStorage.setItem("userRole", action.payload.role);
      state.role = action.payload.role;
    },
    removeAuthToken: (state) => {
      localStorage.clear();
      state.token = "";
    },
  },
});

export const { addAuthToken, removeAuthToken, addUserRole } = authSlice.actions;
export default authSlice.reducer;
