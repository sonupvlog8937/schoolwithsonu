import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchPostalRecords = createAsyncThunk(
  "postalRecord/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Strip empty / null / undefined values so backend doesn't get empty-string params
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
      );
      const res = await axios.get("/api/postal-record", { params: clean });
      return res.data; // { success, data, stats, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createPostalRecord = createAsyncThunk(
  "postalRecord/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/postal-record", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updatePostalRecord = createAsyncThunk(
  "postalRecord/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/postal-record/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deletePostalRecord = createAsyncThunk(
  "postalRecord/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/postal-record/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const bulkDeletePostalRecords = createAsyncThunk(
  "postalRecord/bulkDelete",
  async (ids, { rejectWithValue }) => {
    try {
      const res = await axios.delete("/api/postal-record/bulk-delete", { data: { ids } });
      return { ids, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── Default filter factory ───────────────────────────────────────────────────
const defaultFilters = () => ({
  search:  "",
  date:    "",
  sortBy:  "date_desc",
  page:    1,
  limit:   10,
});

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  records:    [],
  stats:      { total: 0, receiveCount: 0, dispatchCount: 0 },
  pagination: { total: 0, page: 1, limit: 10, pages: 1 },

  // Separate filter state per page-type so Receive and Dispatch don't share search
  receiveFilters:  defaultFilters(),
  dispatchFilters: defaultFilters(),

  // Legacy "all" filters (used when no recordType prop)
  allFilters: { ...defaultFilters(), type: "all" },

  loading:       false,
  submitLoading: false,
  error:         null,
  successMsg:    null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const postalRecordSlice = createSlice({
  name: "postalRecord",
  initialState,
  reducers: {
    /**
     * setFilters({ recordType: "Receive" | "Dispatch" | "all", ...filterKeys })
     * Non-page changes auto-reset page to 1.
     */
    setFilters(state, action) {
      const { recordType = "all", ...rest } = action.payload;
      const key = recordType === "Receive"
        ? "receiveFilters"
        : recordType === "Dispatch"
          ? "dispatchFilters"
          : "allFilters";

      const isPageOnly = Object.keys(rest).every((k) => k === "page" || k === "limit");
      state[key] = {
        ...state[key],
        ...rest,
        ...(isPageOnly ? {} : { page: 1 }),
      };
    },
    clearMessages(state) {
      state.error      = null;
      state.successMsg = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostalRecords.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPostalRecords.fulfilled, (state, { payload }) => {
        state.loading    = false;
        state.records    = payload.data       ?? [];
        state.stats      = payload.stats      ?? state.stats;
        state.pagination = payload.pagination ?? state.pagination;
      })
      .addCase(fetchPostalRecords.rejected,  (state, { payload }) => {
        state.loading = false;
        state.error   = payload || "Failed to fetch records";
      });

    builder
      .addCase(createPostalRecord.pending,   (state) => { state.submitLoading = true; state.error = null; state.successMsg = null; })
      .addCase(createPostalRecord.fulfilled, (state, { payload }) => {
        state.submitLoading = false;
        state.successMsg    = payload.message || "Record created";
        if (payload.data) state.records.unshift(payload.data);
      })
      .addCase(createPostalRecord.rejected,  (state, { payload }) => {
        state.submitLoading = false;
        state.error = payload || "Failed to create record";
      });

    builder
      .addCase(updatePostalRecord.pending,   (state) => { state.submitLoading = true; state.error = null; state.successMsg = null; })
      .addCase(updatePostalRecord.fulfilled, (state, { payload }) => {
        state.submitLoading = false;
        state.successMsg    = payload.message || "Record updated";
        const idx = state.records.findIndex((r) => r._id === payload.data?._id);
        if (idx !== -1) state.records[idx] = payload.data;
      })
      .addCase(updatePostalRecord.rejected,  (state, { payload }) => {
        state.submitLoading = false;
        state.error = payload || "Failed to update record";
      });

    builder
      .addCase(deletePostalRecord.pending,   (state) => { state.submitLoading = true; state.error = null; state.successMsg = null; })
      .addCase(deletePostalRecord.fulfilled, (state, { payload }) => {
        state.submitLoading = false;
        state.successMsg    = "Record deleted";
        state.records = state.records.filter((r) => r._id !== payload);
      })
      .addCase(deletePostalRecord.rejected,  (state, { payload }) => {
        state.submitLoading = false;
        state.error = payload || "Failed to delete record";
      });

    builder
      .addCase(bulkDeletePostalRecords.pending,   (state) => { state.submitLoading = true; state.error = null; state.successMsg = null; })
      .addCase(bulkDeletePostalRecords.fulfilled, (state, { payload }) => {
        state.submitLoading = false;
        state.successMsg    = payload.message || "Records deleted";
        state.records = state.records.filter((r) => !payload.ids.includes(r._id));
      })
      .addCase(bulkDeletePostalRecords.rejected,  (state, { payload }) => {
        state.submitLoading = false;
        state.error = payload || "Failed to delete records";
      });
  },
});

export const { setFilters, clearMessages } = postalRecordSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
/** Pick the right filter slice based on recordType */
export const selectPostalFilters = (recordType) => (state) =>
  recordType === "Receive"
    ? state.postalRecord.receiveFilters
    : recordType === "Dispatch"
      ? state.postalRecord.dispatchFilters
      : state.postalRecord.allFilters;

const postalRecordReducer = postalRecordSlice.reducer;
export default postalRecordReducer;
