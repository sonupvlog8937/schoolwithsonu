import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/** Fetch paginated + filtered enquiries */
export const fetchEnquiries = createAsyncThunk(
  "admissionEnquiry/fetchEnquiries",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/admission-enquiry", { params });
      return res.data; // { items, stats, pagination, statusOptions, sourceOptions, priorityOptions, classes }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Create a new enquiry */
export const createEnquiry = createAsyncThunk(
  "admissionEnquiry/createEnquiry",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/admission-enquiry", data);
      return res.data; // { message, enquiry }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Update an existing enquiry (full edit or quick status change) */
export const updateEnquiry = createAsyncThunk(
  "admissionEnquiry/updateEnquiry",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/admission-enquiry/${id}`, data);
      return res.data; // { message, enquiry }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Delete an enquiry */
export const deleteEnquiry = createAsyncThunk(
  "admissionEnquiry/deleteEnquiry",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/admission-enquiry/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  // list data
  items: [],
  stats: [],          // [{ _id: "New", count: 5 }, ...]
  pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },

  // meta options (from server)
  statusOptions: [],
  sourceOptions: [],
  referenceOptions: [],
  priorityOptions: [],
  classes: [],

  // UI filters (kept in Redux so they survive tab switches)
  filters: {
    q: "",
    status: "all",
    source: "all",
    classInterested: "all",
    sortBy: "createdAt_desc",
    page: 1,
    limit: 10,
  },

  // loading flags
  loading: false,       // list loading
  submitLoading: false, // create / update / delete

  // feedback
  error: null,
  successMsg: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const admissionEnquirySlice = createSlice({
  name: "admissionEnquiry",
  initialState,
  reducers: {
    /** Update one or more filter keys and reset to page 1 */
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    /** Jump to a specific page */
    setPage(state, action) {
      state.filters.page = action.payload;
    },
    clearMessages(state) {
      state.error = null;
      state.successMsg = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchEnquiries ─────────────────────────────────────────────────────
    builder
      .addCase(fetchEnquiries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnquiries.fulfilled, (state, action) => {
        state.loading = false;
        const { items, stats, pagination, statusOptions, sourceOptions, referenceOptions, priorityOptions, classes } = action.payload;
        state.items           = items           ?? [];
        state.stats           = stats           ?? [];
        state.pagination      = pagination      ?? state.pagination;
        state.statusOptions   = statusOptions   ?? state.statusOptions;
        state.sourceOptions   = sourceOptions   ?? state.sourceOptions;
        state.referenceOptions = referenceOptions ?? state.referenceOptions;
        state.priorityOptions = priorityOptions ?? state.priorityOptions;
        state.classes         = classes         ?? state.classes;
      })
      .addCase(fetchEnquiries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch enquiries";
      });

    // ── createEnquiry ──────────────────────────────────────────────────────
    builder
      .addCase(createEnquiry.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(createEnquiry.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Enquiry created successfully";
        // Prepend to list so it appears at top
        if (action.payload.enquiry) {
          state.items.unshift(action.payload.enquiry);
          state.pagination.totalItems += 1;
        }
      })
      .addCase(createEnquiry.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to create enquiry";
      });

    // ── updateEnquiry ──────────────────────────────────────────────────────
    builder
      .addCase(updateEnquiry.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(updateEnquiry.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Enquiry updated successfully";
        const updated = action.payload.enquiry;
        if (updated) {
          const idx = state.items.findIndex((e) => e._id === updated._id);
          if (idx !== -1) state.items[idx] = updated;
        }
      })
      .addCase(updateEnquiry.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to update enquiry";
      });

    // ── deleteEnquiry ──────────────────────────────────────────────────────
    builder
      .addCase(deleteEnquiry.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(deleteEnquiry.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = "Enquiry deleted successfully";
        state.items = state.items.filter((e) => e._id !== action.payload);
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
      })
      .addCase(deleteEnquiry.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to delete enquiry";
      });
  },
});

export const { setFilters, setPage, clearMessages } = admissionEnquirySlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

/** Total count per status as a plain object: { New: 5, Contacted: 2, ... } */
export const selectStatsByStatus = (state) =>
  Object.fromEntries(state.admissionEnquiry.stats.map(({ _id, count }) => [_id, count]));

/** Total enquiries across all statuses */
export const selectTotalEnquiries = (state) =>
  state.admissionEnquiry.pagination.totalItems;

const admissionEnquiryReducer = admissionEnquirySlice.reducer;
export default admissionEnquiryReducer;
