import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../environment";

export const fetchLibraryDashboard = createAsyncThunk(
  "libraryDashboard/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseUrl}/library/dashboard`, {
        headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` },
      });

      const payload = response?.data?.data ?? response?.data ?? {};
      return payload;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load library dashboard");
    }
  }
);

const libraryDashboardSlice = createSlice({
  name: "libraryDashboard",
  initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLibraryDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLibraryDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchLibraryDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default libraryDashboardSlice.reducer;
