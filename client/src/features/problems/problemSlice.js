import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchProblemsAPI, fetchProblemByIdAPI } from "./problemAPI";
import toast from "react-hot-toast";

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchProblems = createAsyncThunk(
  "problems/fetchProblems",
  async (params, { rejectWithValue }) => {
    try {
      const data = await fetchProblemsAPI(params);
      return data;
    } catch (error) {
      const status = error.response?.status;
      // Rate limit hit — give a helpful user-facing message
      if (status === 429) {
        return rejectWithValue("Too many requests. Please wait a moment and try again.");
      }
      // Server error
      if (status >= 500) {
        return rejectWithValue("Server error. Please try again shortly.");
      }
      // Network error (server offline / restarting)
      if (!error.response) {
        return rejectWithValue("Cannot reach server. Please check your connection.");
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch problems");
    }
  }
);

export const fetchProblemById = createAsyncThunk(
  "problems/fetchProblemById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await fetchProblemByIdAPI(id);
      return data;
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        return rejectWithValue("Too many requests. Please wait a moment and try again.");
      }
      if (status === 404) {
        return rejectWithValue("Problem not found.");
      }
      if (!error.response) {
        return rejectWithValue("Cannot reach server. Please check your connection.");
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch problem");
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  problems: [],
  selectedProblem: null,
  loading: false,
  detailLoading: false,
  error: null,
  detailError: null,
  page: 1,
  totalPages: 1,
  totalProblems: 0,
  search: "",
  difficulty: "",
  tag: "",
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const problemSlice = createSlice({
  name: "problems",
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
      state.page = 1; // Reset to page 1 on new search
    },
    setDifficulty: (state, action) => {
      state.difficulty = action.payload;
      state.page = 1;
    },
    setTag: (state, action) => {
      state.tag = action.payload;
      state.page = 1;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    resetFilters: (state) => {
      state.search = "";
      state.difficulty = "";
      state.tag = "";
      state.page = 1;
    },
    clearSelectedProblem: (state) => {
      state.selectedProblem = null;
      state.detailError = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Problems List
    builder
      .addCase(fetchProblems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProblems.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.problems = payload?.data || [];
        state.totalPages = payload?.pagination?.totalPages || 1;
        state.totalProblems = payload?.pagination?.totalCount || 0;
        state.page = payload?.pagination?.page || state.page;
      })
      .addCase(fetchProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to load problems");
      });

    // Fetch Single Problem
    builder
      .addCase(fetchProblemById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.selectedProblem = null;
      })
      .addCase(fetchProblemById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProblem = action.payload?.data || action.payload || null;
      })
      .addCase(fetchProblemById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
        toast.error(action.payload || "Failed to load problem");
      });
  },
});

export const {
  setSearch,
  setDifficulty,
  setTag,
  setPage,
  resetFilters,
  clearSelectedProblem,
  clearError,
} = problemSlice.actions;

export default problemSlice.reducer;
