import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  birth_date: string;
  gender_id: string;
  profile_url: string;
};

const initialState = {
  userData: {
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    gender_id: "1",
    profile_url: "",
    birth_date: "",
  },
};

const loggedInUserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addUserProfileData: (state, action: PayloadAction<FormData>) => {
      const payload = { ...action.payload };
      state.userData = payload;
    },
    updateProfileData: (state, action: PayloadAction<Partial<FormData>>) => {
      const payload = { ...action.payload };
      state.userData = { ...state.userData, ...payload };
    },
  },
});

export const { addUserProfileData, updateProfileData } =
  loggedInUserSlice.actions;

export default loggedInUserSlice.reducer;
