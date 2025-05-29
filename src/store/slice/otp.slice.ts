import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  attempts: 0,
};

const otpSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateOtpAttempts: (state, action: PayloadAction<boolean | undefined>) => {
      const setZero = action.payload;
      if (setZero) {
        state.attempts = 0;
      } else if (state.attempts < 3) {
        state.attempts = state.attempts + 1;
      }
    },
  },
});

export const { updateOtpAttempts } = otpSlice.actions;

export default otpSlice.reducer;
