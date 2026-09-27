import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../environment";

const dashboardTypes = ["follow-up", "complaint", "visitor", "chat", "user-activity"];

export const fetchSchoolDashboard = createAsyncThunk(
  "schoolDashboards/fetch",
  async (type, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const options = typeof type === "object" ? type : { type };
      const dashboardType = options.type;
      const response = await axios.get(`${baseUrl}/dashboard/${dashboardType}`, {
        headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` },
        params: { days: options.days, page: options.page, limit: options.limit, search: options.search, role: options.role, status: options.status },
      });
      return { type: dashboardType, data: response.data.data };
    } catch (error) {
      return rejectWithValue({ type: typeof type === "object" ? type.type : type, message: error.response?.data?.message || "Unable to load dashboard" });
    }
  },
);

const initialState = dashboardTypes.reduce((state, type) => {
  state[type] = { data: null, loading: false, error: null };
  return state;
}, {});

const schoolDashboardsSlice = createSlice({
  name: "schoolDashboards",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchoolDashboard.pending, (state, action) => {
        const type = typeof action.meta.arg === "object" ? action.meta.arg.type : action.meta.arg;
        state[type].loading = true;
        state[type].error = null;
      })
      .addCase(fetchSchoolDashboard.fulfilled, (state, action) => {
        state[action.payload.type] = { data: action.payload.data, loading: false, error: null };
      })
      .addCase(fetchSchoolDashboard.rejected, (state, action) => {
        const { type, message } = action.payload || {};
        if (type) state[type] = { data: null, loading: false, error: message };
      });
  },
});

export default schoolDashboardsSlice.reducer;
