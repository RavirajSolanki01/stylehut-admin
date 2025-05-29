import { combineReducers } from "redux";
import authReducer from "./auth.slice";
import usersReducer from "./users.slice";
import otpReducer from "./otp.slice";

export const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  otp: otpReducer,
});
