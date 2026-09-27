import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../environment";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}`,
  };
};

// Async thunk to fetch staff dashboard data
export const fetchStaffDashboard = createAsyncThunk(
  "staffDashboard/fetchStaffDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/dashboard/staff-dashboard`, {
        headers: getAuthHeaders(),
      });
      return response.data.data || {};
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch staff dashboard data"
      );
    }
  }
);

// Async thunk to fetch staff attendance
export const fetchStaffAttendance = createAsyncThunk(
  "staffDashboard/fetchStaffAttendance",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/dashboard/staff-attendance`, {
        headers: getAuthHeaders(),
      });
      return response.data.data || {
        percentage: 0,
        present: 0,
        absent: 0,
        leave: 0,
        total: 0,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch staff attendance"
      );
    }
  }
);

// Async thunk to fetch upcoming events
export const fetchUpcomingEvents = createAsyncThunk(
  "staffDashboard/fetchUpcomingEvents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/dashboard/upcoming-events`, {
        headers: getAuthHeaders(),
      });
      return response.data.data?.events || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch events"
      );
    }
  }
);

// Async thunk to fetch upcoming holidays
export const fetchUpcomingHolidays = createAsyncThunk(
  "staffDashboard/fetchUpcomingHolidays",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/dashboard/upcoming-holidays`, {
        headers: getAuthHeaders(),
      });
      return response.data.data?.holidays || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch holidays"
      );
    }
  }
);

// Async thunk to fetch recent notices
export const fetchRecentNotices = createAsyncThunk(
  "staffDashboard/fetchRecentNotices",
  async (limit = 5, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/dashboard/recent-notices`, {
        headers: getAuthHeaders(),
        params: { limit },
      });
      return response.data.data?.notices || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notices"
      );
    }
  }
);

const staffDashboardSlice = createSlice({
  name: "staffDashboard",
  initialState: {
    // User info
    user: null,

    // Attendance data
    attendance: {
      percentage: 0,
      present: 0,
      absent: 0,
      leave: 0,
      total: 0,
    },

    // Events and holidays
    events: [],
    holidays: [],
    notices: [],

    // Loading states
    loading: false,
    attendanceLoading: false,
    eventsLoading: false,
    holidaysLoading: false,
    noticesLoading: false,

    // Error states
    error: null,
    attendanceError: null,
    eventsError: null,
    holidaysError: null,
    noticesError: null,
  },
  reducers: {
    // Set user info from localStorage
    setUser: (state, action) => {
      state.user = action.payload;
    },

    // Clear all data
    clearStaffDashboard: (state) => {
      state.user = null;
      state.attendance = {
        percentage: 0,
        present: 0,
        absent: 0,
        leave: 0,
        total: 0,
      };
      state.events = [];
      state.holidays = [];
      state.notices = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Staff Dashboard
    builder
      .addCase(fetchStaffDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffDashboard.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.user) {
          state.user = action.payload.user;
        } else if (action.payload && !Array.isArray(action.payload)) {
          state.user = action.payload;
        }
      })
      .addCase(fetchStaffDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Staff Attendance
    builder
      .addCase(fetchStaffAttendance.pending, (state) => {
        state.attendanceLoading = true;
        state.attendanceError = null;
      })
      .addCase(fetchStaffAttendance.fulfilled, (state, action) => {
        state.attendanceLoading = false;
        state.attendance = action.payload;
      })
      .addCase(fetchStaffAttendance.rejected, (state, action) => {
        state.attendanceLoading = false;
        state.attendanceError = action.payload;
      });

    // Fetch Upcoming Events
    builder
      .addCase(fetchUpcomingEvents.pending, (state) => {
        state.eventsLoading = true;
        state.eventsError = null;
      })
      .addCase(fetchUpcomingEvents.fulfilled, (state, action) => {
        state.eventsLoading = false;
        state.events = action.payload;
      })
      .addCase(fetchUpcomingEvents.rejected, (state, action) => {
        state.eventsLoading = false;
        state.eventsError = action.payload;
      });

    // Fetch Upcoming Holidays
    builder
      .addCase(fetchUpcomingHolidays.pending, (state) => {
        state.holidaysLoading = true;
        state.holidaysError = null;
      })
      .addCase(fetchUpcomingHolidays.fulfilled, (state, action) => {
        state.holidaysLoading = false;
        state.holidays = action.payload;
      })
      .addCase(fetchUpcomingHolidays.rejected, (state, action) => {
        state.holidaysLoading = false;
        state.holidaysError = action.payload;
      });

    // Fetch Recent Notices
    builder
      .addCase(fetchRecentNotices.pending, (state) => {
        state.noticesLoading = true;
        state.noticesError = null;
      })
      .addCase(fetchRecentNotices.fulfilled, (state, action) => {
        state.noticesLoading = false;
        state.notices = action.payload;
      })
      .addCase(fetchRecentNotices.rejected, (state, action) => {
        state.noticesLoading = false;
        state.noticesError = action.payload;
      });
  },
});

export const { setUser, clearStaffDashboard } = staffDashboardSlice.actions;

export default staffDashboardSlice.reducer;
