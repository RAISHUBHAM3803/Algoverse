import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginAPI, registerAPI, logoutAPI, loadUserAPI, updateProfileAPI } from "./authAPI";
import { setToken, clearToken, getToken } from "../../utils/tokenStorage";
import toast from "react-hot-toast";

const initialState = {
  user: null,
  token: getToken(),
  isAuthenticated: !!getToken(),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const data = await loginAPI(credentials);
      // After login, fetch full user data (includes currentStreak from auth/me)
      setTimeout(() => dispatch(loadUser()), 0);
      return data;
    } catch (error) {
      const responseData = error.response?.data;
      if (responseData) {
        if (responseData.errors && responseData.errors.length > 0) {
          return rejectWithValue(responseData.errors[0].message);
        }
        return rejectWithValue(responseData.message || "Login failed");
      }
      return rejectWithValue("Network Error: Could not connect to the server (Login)");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const data = await registerAPI(userData);
      // After register, fetch full user data (includes currentStreak from auth/me)
      setTimeout(() => dispatch(loadUser()), 0);
      return data;
    } catch (error) {
      const responseData = error.response?.data;
      if (responseData) {
        if (responseData.errors && responseData.errors.length > 0) {
          return rejectWithValue(responseData.errors[0].message);
        }
        return rejectWithValue(responseData.message || "Registration failed");
      }
      return rejectWithValue("Network Error: Could not connect to the server (Registration)");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutAPI();
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const data = await loadUserAPI();
      return data;
    } catch (error) {
      // Distinguish between a real auth failure (401) vs the server being offline.
      const isAuthError = error.response?.status === 401 || error.response?.status === 403;
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to load user",
        isAuthError,
      });
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const data = await updateProfileAPI(profileData);
      return data;
    } catch (error) {
      const responseData = error.response?.data;
      return rejectWithValue(responseData?.message || "Failed to update profile");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        const payload = action.payload?.data ?? action.payload;
        state.user = payload?.user ?? null;
        state.token = payload?.accessToken ?? null;
        setToken(payload?.accessToken);
        toast.success("Login successful!");
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        const payload = action.payload?.data ?? action.payload;
        state.user = payload?.user ?? null;
        state.token = payload?.accessToken ?? null;
        setToken(payload?.accessToken);
        toast.success("Registration successful!");
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        clearToken();
        toast.success("Logged out successfully");
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        clearToken();
      });

    // Load User
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        const { isAuthError } = action.payload || {};

        if (isAuthError) {
          // Genuine 401/403 — the token is invalid or the account is deactivated.
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          clearToken();
          toast.error("Session expired. Please login again.");
        } else {
          // Network error or server temporarily offline — keep existing session alive.
        }
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload?.data ?? action.payload;
        if (payload?.user) {
          state.user = { ...state.user, ...payload.user };
        }
        toast.success("Profile updated successfully!");
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to update profile");
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
