import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchLogs = createAsyncThunk(
  "phoneCallLog/fetchLogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
      );
      const res = await axios.get("/api/phone-call-log", { params: clean });
      return res.data; // { success, data, stats, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createLog = createAsyncThunk(
  "phoneCallLog/createLog",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/phone-call-log", data);
      return res.data; // { success, message, data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateLog = createAsyncThunk(
  "phoneCallLog/updateLog",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/phone-call-log/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteLog = createAsyncThunk(
  "phoneCallLog/deleteLog",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/phone-call-log/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const bulkDeleteLogs = createAsyncThunk(
  "phoneCallLog/bulkDelete",
  async (ids, { rejectWithValue }) => {
    try {
      const res = await axios.delete("/api/phone-call-log/bulk-delete", { data: { ids } });
      return { ids, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  logs: [],
  stats: { total: 0, incomingCount: 0, outgoingCount: 0, followUpCount: 0 },
  pagination: { total: 0, page: 1, limit: 10, pages: 1 },

  filters: {
    search: "",
    callType: "all",   // "all" | "Incoming" | "Outgoing"
    date: "",
    followUpDate: "",
    sortBy: "date_desc",
    page: 1,
    limit: 10,
  },

  loading: false,
  submitLoading: false,
  error: null,
  successMsg: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const phoneCallLogSlice = createSlice({
  name: "phoneCallLog",
  initialState,
  reducers: {
    setFilters(state, action) {
      const isPageOnly = Object.keys(action.payload).every((k) => k === "page" || k === "limit");
      state.filters = {
        ...state.filters,
        ...action.payload,
        ...(isPageOnly ? {} : { page: 1 }),
      };
    },
    clearMessages(state) {
      state.error = null;
      state.successMsg = null;
    },
  },
  extraReducers: (builder) => {
    // fetchLogs
    builder
      .addCase(fetchLogs.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchLogs.fulfilled, (state, { payload }) => {
        state.loading    = false;
        state.logs       = payload.data       ?? [];
        state.stats      = payload.stats      ?? state.stats;
        state.pagination = payload.pagination ?? state.pagination;
      })
      .addCase(fetchLogs.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload || "Failed to fetch logs";
      });

    // createLog
    builder
      .addCase(createLog.pending, (state) => { state.submitLoading = true; state.error = null; state.successMsg = null; })
      .addCase(createLog.fulfilled, (state, { payload }) => {
        state.submitLoading = false;
        state.successMsg    = payload.message || "Log created";
        if (payload.data) state.logs.unshift(payload.data);
      })
      .addCase(createLog.rejected, (state, { payload }) => {
        state.submitLoading = false;
        state.error = payload || "Failed to create log";
      });

    // updateLog
    builder
      .addCase(updateLog.pending, (state) => { state.submitLoading = true; state.error = null; state.successMsg = null; })
      .addCase(updateLog.fulfilled, (state, { payload }) => {
        state.submitLoading = false;
        state.successMsg    = payload.message || "Log updated";
        const idx = state.logs.findIndex((l) => l._id === payload.data?._id);
        if (idx !== -1) state.logs[idx] = payload.data;
      })
      .addCase(updateLog.rejected, (state, { payload }) => {
        state.submitLoading = false;
        state.error = payload || "Failed to update log";
      });

    // deleteLog
    builder
      .addCase(deleteLog.pending, (state) => { state.submitLoading = true; state.error = null; state.successMsg = null; })
      .addCase(deleteLog.fulfilled, (state, { payload }) => {
        state.submitLoading = false;
        state.successMsg    = "Log deleted";
        state.logs = state.logs.filter((l) => l._id !== payload);
      })
      .addCase(deleteLog.rejected, (state, { payload }) => {
        state.submitLoading = false;
        state.error = payload || "Failed to delete log";
      });

    // bulkDeleteLogs
    builder
      .addCase(bulkDeleteLogs.pending, (state) => { state.submitLoading = true; state.error = null; state.successMsg = null; })
      .addCase(bulkDeleteLogs.fulfilled, (state, { payload }) => {
        state.submitLoading = false;
        state.successMsg    = payload.message || "Logs deleted";
        state.logs = state.logs.filter((l) => !payload.ids.includes(l._id));
      })
      .addCase(bulkDeleteLogs.rejected, (state, { payload }) => {
        state.submitLoading = false;
        state.error = payload || "Failed to delete logs";
      });
  },
});

export const { setFilters, clearMessages } = phoneCallLogSlice.actions;
export const selectCallFilters = (state) => state.phoneCallLog.filters;
const phoneCallLogReducer = phoneCallLogSlice.reducer;
export default phoneCallLogReducer;
