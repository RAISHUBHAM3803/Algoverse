import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import problemReducer from "../features/problems/problemSlice";
import editorReducer from "../features/editor/editorSlice";
import submissionReducer from "../features/submissions/submissionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    problems: problemReducer,
    editor: editorReducer,
    submissions: submissionReducer,
  },
  devTools: import.meta.env.NODE_ENV !== "production",
});
