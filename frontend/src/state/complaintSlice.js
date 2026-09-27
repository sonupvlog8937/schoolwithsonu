import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchComplaints = createAsyncThunk(
  "complaint/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined && v !== "all")
      );
      const res = await axios.get("/api/complaint", { params: clean });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createComplaint = createAsyncThunk(
  "complaint/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/complaint", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateComplaint = createAsyncThunk(
  "complaint/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/complaint/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateComplaintStatus = createAsyncThunk(
  "complaint/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`/api/complaint/${id}/status`, { status });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteComplaint = createAsyncThunk(
  "complaint/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/complaint/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const bulkDeleteComplaints = createAsyncThunk(
  "complaint/bulkDelete",
  async (ids, { rejectWithValue }) => {
    try {
      const res = await axios.delete("/api/complaint/bulk-delete", { data: { ids } });
      return { ids, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  complaints: [],
  stats: { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, high: 0, medium: 0, low: 0 },
  pagination: { total: 0, page: 1, limit: 10, pages: 1 },

  // Dynamic options from Setup
  complaintTypeOptions: [],
  sourceOptions: [],

  filters: {
    search:        "",
    status:        "all",
    complaintType: "all",
    source:        "all",
    priority:      "all",
    date:          "",
    sortBy:        "date_desc",
    page:          1,
    limit:         10,
  },

  loading:       false,
  submitLoading: false,
  error:         null,
  successMsg:    null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const complaintSlice = createSlice({
  name: "complaint",
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
      state.error      = null;
      state.successMsg = null;
    },
  },
  extraReducers: (builder) => {
    // fetchComplaints
    builder
      .addCase(fetchComplaints.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchComplaints.fulfilled, (s, { payload }) => {
        s.loading    = false;
        s.complaints = payload.data       ?? [];
        s.stats      = payload.stats      ?? s.stats;
        s.pagination = payload.pagination ?? s.pagination;
        s.complaintTypeOptions = payload.complaintTypeOptions ?? [];
        s.sourceOptions        = payload.sourceOptions        ?? [];
      })
      .addCase(fetchComplaints.rejected,  (s, { payload }) => { s.loading = false; s.error = payload || "Failed to fetch"; });

    // createComplaint
    builder
      .addCase(createComplaint.pending,   (s) => { s.submitLoading = true; s.error = null; s.successMsg = null; })
      .addCase(createComplaint.fulfilled, (s, { payload }) => {
        s.submitLoading = false;
        s.successMsg    = payload.message || "Complaint created";
        if (payload.data) s.complaints.unshift(payload.data);
      })
      .addCase(createComplaint.rejected,  (s, { payload }) => { s.submitLoading = false; s.error = payload || "Failed to create"; });

    // updateComplaint
    builder
      .addCase(updateComplaint.pending,   (s) => { s.submitLoading = true; s.error = null; s.successMsg = null; })
      .addCase(updateComplaint.fulfilled, (s, { payload }) => {
        s.submitLoading = false;
        s.successMsg    = payload.message || "Complaint updated";
        const idx = s.complaints.findIndex((c) => c._id === payload.data?._id);
        if (idx !== -1) s.complaints[idx] = payload.data;
      })
      .addCase(updateComplaint.rejected,  (s, { payload }) => { s.submitLoading = false; s.error = payload || "Failed to update"; });

    // updateComplaintStatus
    builder
      .addCase(updateComplaintStatus.fulfilled, (s, { payload }) => {
        s.successMsg = payload.message || "Status updated";
        const idx = s.complaints.findIndex((c) => c._id === payload.data?._id);
        if (idx !== -1) s.complaints[idx] = payload.data;
      })
      .addCase(updateComplaintStatus.rejected, (s, { payload }) => { s.error = payload || "Failed to update status"; });

    // deleteComplaint
    builder
      .addCase(deleteComplaint.pending,   (s) => { s.submitLoading = true; s.error = null; s.successMsg = null; })
      .addCase(deleteComplaint.fulfilled, (s, { payload }) => {
        s.submitLoading = false;
        s.successMsg    = "Complaint deleted";
        s.complaints    = s.complaints.filter((c) => c._id !== payload);
      })
      .addCase(deleteComplaint.rejected,  (s, { payload }) => { s.submitLoading = false; s.error = payload || "Failed to delete"; });

    // bulkDeleteComplaints
    builder
      .addCase(bulkDeleteComplaints.pending,   (s) => { s.submitLoading = true; s.error = null; s.successMsg = null; })
      .addCase(bulkDeleteComplaints.fulfilled, (s, { payload }) => {
        s.submitLoading = false;
        s.successMsg    = payload.message || "Complaints deleted";
        s.complaints    = s.complaints.filter((c) => !payload.ids.includes(c._id));
      })
      .addCase(bulkDeleteComplaints.rejected,  (s, { payload }) => { s.submitLoading = false; s.error = payload || "Failed to delete"; });
  },
});

export const { setFilters, clearMessages } = complaintSlice.actions;
export const selectComplaintFilters = (state) => state.complaint.filters;
const complaintReducer = complaintSlice.reducer;
export default complaintReducer;
