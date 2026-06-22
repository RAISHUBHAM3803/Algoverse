import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { executeCodeAPI } from "./editorAPI";

const initialState = {
  code: "",
  language: "cpp",
  output: null,
  loading: false,
  error: null,
  submissionResult: null,  // stores the last submit verdict (separate from run output)
  isSubmitting: false,
};

export const executeCode = createAsyncThunk(
  "editor/executeCode",
  async (executeData, { rejectWithValue }) => {
    try {
      const data = await executeCodeAPI(executeData);
      return data;
    } catch (error) {
      // Return the full error payload so the UI can show verdict type (Compilation Error, etc.)
      const responseData = error.response?.data;
      return rejectWithValue({
        message: responseData?.message || "Execution failed",
        status:  responseData?.errors?.[0] || "Error",
      });
    }
  }
);

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setCode: (state, action) => {
      state.code = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    clearOutput: (state) => {
      state.output = null;
    },
    setSubmissionResult: (state, action) => {
      state.submissionResult = action.payload;
      state.isSubmitting = false;
    },
    clearSubmissionResult: (state) => {
      state.submissionResult = null;
    },
    setEditorSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(executeCode.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.output = null;
      })
      .addCase(executeCode.fulfilled, (state, action) => {
        state.loading = false;
        state.output = action.payload.data;
      })
      .addCase(executeCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // { message, status }
      });
  },
});

export const { setCode, setLanguage, clearOutput, setSubmissionResult, clearSubmissionResult, setEditorSubmitting } = editorSlice.actions;
export default editorSlice.reducer;
