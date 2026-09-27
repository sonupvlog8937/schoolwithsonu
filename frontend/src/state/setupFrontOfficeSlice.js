import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ─── Helper: Get Endpoint ─────────────────────────────────────────────────────
const getEndpoint = (type) => {
  const endpoints = {
    purpose: "/api/setup/purpose",
    complaintType: "/api/setup/complaint-type",
    source: "/api/setup/source",
    reference: "/api/setup/reference",
  };
  return endpoints[type] || endpoints.purpose;
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/** Fetch setup data (Purpose, Complaint Type, Source, Reference) */
export const fetchSetupData = createAsyncThunk(
  "setupFrontOffice/fetchData",
  async ({ type, params = {} }, { rejectWithValue }) => {
    try {
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
      );
      const endpoint = getEndpoint(type);
      const res = await axios.get(endpoint, { params: clean });
      return { type, data: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Create new setup item */
export const createSetupItem = createAsyncThunk(
  "setupFrontOffice/create",
  async ({ type, data }, { rejectWithValue }) => {
    try {
      const endpoint = getEndpoint(type);
      const res = await axios.post(endpoint, data);
      return { type, data: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Update setup item */
export const updateSetupItem = createAsyncThunk(
  "setupFrontOffice/update",
  async ({ type, id, data }, { rejectWithValue }) => {
    try {
      const endpoint = getEndpoint(type);
      const res = await axios.put(`${endpoint}/${id}`, data);
      return { type, data: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Delete setup item */
export const deleteSetupItem = createAsyncThunk(
  "setupFrontOffice/delete",
  async ({ type, id }, { rejectWithValue }) => {
    try {
      const endpoint = getEndpoint(type);
      await axios.delete(`${endpoint}/${id}`);
      return { type, id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  // Data for each type
  purpose: {
    data: [],
    pagination: { total: 0, page: 1, limit: 10, pages: 1 },
    filters: { search: "", page: 1, limit: 10 },
  },
  complaintType: {
    data: [],
    pagination: { total: 0, page: 1, limit: 10, pages: 1 },
    filters: { search: "", page: 1, limit: 10 },
  },
  source: {
    data: [],
    pagination: { total: 0, page: 1, limit: 10, pages: 1 },
    filters: { search: "", page: 1, limit: 10 },
  },
  reference: {
    data: [],
    pagination: { total: 0, page: 1, limit: 10, pages: 1 },
    filters: { search: "", page: 1, limit: 10 },
  },

  // Active tab
  activeTab: "purpose",

  // Loading states
  loading: false,
  submitLoading: false,

  // Messages
  error: null,
  successMsg: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const setupFrontOfficeSlice = createSlice({
  name: "setupFrontOffice",
  initialState,
  reducers: {
    /** Set active tab */
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },

    /** Update filters for specific type */
    setFilters(state, action) {
      const { type, filters } = action.payload;
      if (state[type]) {
        const isPageOnly = Object.keys(filters).every((k) => k === "page" || k === "limit");
        state[type].filters = {
          ...state[type].filters,
          ...filters,
          // Reset to page 1 when non-page filter changes
          ...(isPageOnly ? {} : { page: 1 }),
        };
      }
    },

    /** Clear messages */
    clearMessages(state) {
      state.error = null;
      state.successMsg = null;
    },

    /** Reset all data (useful for logout) */
    resetSetupData(state) {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    // ── fetchSetupData ─────────────────────────────────────────────────────
    builder
      .addCase(fetchSetupData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSetupData.fulfilled, (state, action) => {
        state.loading = false;
        const { type, data } = action.payload;
        if (state[type]) {
          state[type].data = data.data || [];
          state[type].pagination = data.pagination || state[type].pagination;
        }
      })
      .addCase(fetchSetupData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch data";
      });

    // ── createSetupItem ────────────────────────────────────────────────────
    builder
      .addCase(createSetupItem.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(createSetupItem.fulfilled, (state, action) => {
        state.submitLoading = false;
        const { type, data } = action.payload;
        state.successMsg = data.message || "Item created successfully";
        if (state[type] && data.data) {
          state[type].data.unshift(data.data);
        }
      })
      .addCase(createSetupItem.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to create item";
      });

    // ── updateSetupItem ────────────────────────────────────────────────────
    builder
      .addCase(updateSetupItem.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(updateSetupItem.fulfilled, (state, action) => {
        state.submitLoading = false;
        const { type, data } = action.payload;
        state.successMsg = data.message || "Item updated successfully";
        if (state[type] && data.data) {
          const idx = state[type].data.findIndex((item) => item._id === data.data._id);
          if (idx !== -1) {
            state[type].data[idx] = data.data;
          }
        }
      })
      .addCase(updateSetupItem.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to update item";
      });

    // ── deleteSetupItem ────────────────────────────────────────────────────
    builder
      .addCase(deleteSetupItem.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(deleteSetupItem.fulfilled, (state, action) => {
        state.submitLoading = false;
        const { type, id } = action.payload;
        state.successMsg = "Item deleted successfully";
        if (state[type]) {
          state[type].data = state[type].data.filter((item) => item._id !== id);
        }
      })
      .addCase(deleteSetupItem.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to delete item";
      });
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────────
export const { setActiveTab, setFilters, clearMessages, resetSetupData } = setupFrontOfficeSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectActiveTab = (state) => state.setupFrontOffice.activeTab;
export const selectSetupData = (type) => (state) => state.setupFrontOffice[type];
export const selectSetupFilters = (type) => (state) => state.setupFrontOffice[type]?.filters;
export const selectSetupLoading = (state) => state.setupFrontOffice.loading;
export const selectSetupSubmitLoading = (state) => state.setupFrontOffice.submitLoading;
export const selectSetupError = (state) => state.setupFrontOffice.error;
export const selectSetupSuccessMsg = (state) => state.setupFrontOffice.successMsg;

// ─── Reducer ──────────────────────────────────────────────────────────────────
const setupFrontOfficeReducer = setupFrontOfficeSlice.reducer;
export default setupFrontOfficeReducer;
