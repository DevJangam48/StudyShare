// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import notificationReducer from "./notificationSlice"; // replace with your actual slice
import authReducer from "./authSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    // add other reducers here
  },
});
