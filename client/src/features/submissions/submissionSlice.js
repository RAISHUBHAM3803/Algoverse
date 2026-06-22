import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { submitCodeAPI, streamSubmissionAPI, getMySubmissionsAPI, getSubmissionByIdAPI } from "./submissionAPI";
import { loadUser } from "../auth/authSlice";
import toast from "react-hot-toast";

const initialState = {
  submissions: [],
  currentSubmission: null,
  loading: false,
  submitting: false, // true while SSE connection is open, waiting for verdict
  error: null,
};

export const submitCode = createAsyncThunk(
  "submissions/submitCode",
  async (submissionData, { rejectWithValue, dispatch }) => {
    try {
      // Step 1: Enqueue the submission — gets a jobId back instantly
      const enqueueResponse = await submitCodeAPI(submissionData);
      const jobId = enqueueResponse?.data?.jobId;

      if (!jobId) {
        return rejectWithValue("Failed to queue submission. Please try again.");
      }

      // Step 2: Open SSE stream — waits passively until the worker pushes the result
      const result = await streamSubmissionAPI(jobId);
      
      // Update global user state (stats) after a successful submission
      dispatch(loadUser());
      
      return result;
    } catch (error) {
      return rejectWithValue(
        error.message || error.response?.data?.message || "Submission failed"
      );
    }
  }
);

export const getMySubmissions = createAsyncThunk(
  "submissions/getMySubmissions",
  async (params, { rejectWithValue }) => {
    try {
      const data = await getMySubmissionsAPI(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch submissions"
      );
    }
  }
);

export const getSubmissionById = createAsyncThunk(
  "submissions/getSubmissionById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await getSubmissionByIdAPI(id);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch submission details"
      );
    }
  }
);

const submissionSlice = createSlice({
  name: "submissions",
  initialState,
  reducers: {
    clearCurrentSubmission: (state) => {
      state.currentSubmission = null;
    },
  },
  extraReducers: (builder) => {
    // Submit Code (BullMQ + SSE)
    builder
      .addCase(submitCode.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitCode.fulfilled, (state, action) => {
        state.submitting = false;
        // SSE result is pushed directly as the full result object
        state.currentSubmission = action.payload;
        // We do NOT manually push into state.submissions here because the payload 
        // doesn't have createdAt/problem/language populated. The SubmissionHistory 
        // page fetches the latest list on mount automatically.
      })
      .addCase(submitCode.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // Get My Submissions
    builder
      .addCase(getMySubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMySubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = action.payload.data;
      })
      .addCase(getMySubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Submission By ID
    builder
      .addCase(getSubmissionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubmissionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubmission = action.payload.data;
      })
      .addCase(getSubmissionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentSubmission } = submissionSlice.actions;
export default submissionSlice.reducer;
