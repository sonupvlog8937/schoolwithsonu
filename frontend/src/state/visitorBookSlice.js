import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/** Fetch visitors — all filter/search params sent to backend */
export const fetchVisitors = createAsyncThunk(
  "visitorBook/fetchVisitors",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Strip empty values so backend doesn't get empty-string params
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
      );
      const res = await axios.get("/api/visitor-book/all", { params: clean });
      return res.data; // { success, data, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchVisitorStats = createAsyncThunk(
  "visitorBook/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/visitor-book/stats");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addVisitor = createAsyncThunk(
  "visitorBook/addVisitor",
  async (visitorData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/visitor-book/add", visitorData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateVisitor = createAsyncThunk(
  "visitorBook/updateVisitor",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/visitor-book/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const checkoutVisitor = createAsyncThunk(
  "visitorBook/checkoutVisitor",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/visitor-book/${id}/checkout`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteVisitor = createAsyncThunk(
  "visitorBook/deleteVisitor",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/visitor-book/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  visitors: [],
  stats: null,
  pagination: { total: 0, page: 1, limit: 50, pages: 0 },
  purposeOptions: [], // Dynamic from Setup → Purpose

  // All active filters — kept in Redux so tab switches don't reset them
  filters: {
    search: "",
    status: "",       // "" = all, "In", "Out"
    meetingWith: "",  // "" = all
    date: "",
    tab: 0,           // 0=All, 1=In, 2=Out
    page: 1,
    limit: 10,
  },

  loading: false,
  submitLoading: false,
  error: null,
  successMsg: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const visitorBookSlice = createSlice({
  name: "visitorBook",
  initialState,
  reducers: {
    /** Update one or more filter keys.
     *  Any change except page/limit resets page to 1. */
    setFilters(state, action) {
      const isPageChange = Object.keys(action.payload).every((k) =>
        k === "page" || k === "limit"
      );
      state.filters = {
        ...state.filters,
        ...action.payload,
        // reset to page 1 whenever a non-page filter changes
        ...(isPageChange ? {} : { page: 1 }),
      };
    },
    clearMessages(state) {
      state.error = null;
      state.successMsg = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchVisitors ──────────────────────────────────────────────────────
    builder
      .addCase(fetchVisitors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVisitors.fulfilled, (state, action) => {
        state.loading = false;
        state.visitors      = action.payload.data          || [];
        state.purposeOptions = action.payload.purposeOptions || [];
        state.pagination    = action.payload.pagination    || state.pagination;
      })
      .addCase(fetchVisitors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch visitors";
      });

    // ── fetchVisitorStats ──────────────────────────────────────────────────
    builder.addCase(fetchVisitorStats.fulfilled, (state, action) => {
      state.stats = action.payload;
    });

    // ── addVisitor ─────────────────────────────────────────────────────────
    builder
      .addCase(addVisitor.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(addVisitor.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Visitor added successfully";
        if (action.payload.data) state.visitors.unshift(action.payload.data);
      })
      .addCase(addVisitor.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to add visitor";
      });

    // ── updateVisitor ──────────────────────────────────────────────────────
    builder
      .addCase(updateVisitor.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(updateVisitor.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Visitor updated successfully";
        const updated = action.payload.data;
        if (updated) {
          const idx = state.visitors.findIndex((v) => v._id === updated._id);
          if (idx !== -1) state.visitors[idx] = updated;
        }
      })
      .addCase(updateVisitor.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to update visitor";
      });

    // ── checkoutVisitor ────────────────────────────────────────────────────
    builder
      .addCase(checkoutVisitor.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(checkoutVisitor.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Visitor checked out";
        const updated = action.payload.data;
        if (updated) {
          const idx = state.visitors.findIndex((v) => v._id === updated._id);
          if (idx !== -1) state.visitors[idx] = updated;
        }
      })
      .addCase(checkoutVisitor.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to checkout visitor";
      });

    // ── deleteVisitor ──────────────────────────────────────────────────────
    builder
      .addCase(deleteVisitor.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(deleteVisitor.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = "Visitor deleted successfully";
        state.visitors = state.visitors.filter((v) => v._id !== action.payload);
      })
      .addCase(deleteVisitor.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to delete visitor";
      });
  },
});

export const { setFilters, clearMessages } = visitorBookSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectVisitorFilters = (state) => state.visitorBook.filters;

const visitorBookReducer = visitorBookSlice.reducer;
export default visitorBookReducer;
