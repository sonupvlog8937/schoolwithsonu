import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../environment";

const authConfig = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` } };
};

// Fetch all records for a module
export const fetchMasterConfig = createAsyncThunk(
  "masterConfiguration/fetch",
  async (module, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/master-config/${module}`, authConfig());
      return { module, records: response.data.data };
    } catch (error) {
      return rejectWithValue({ module, message: error.response?.data?.message || "Unable to load configuration" });
    }
  }
);

// Create new record
export const createMasterConfig = createAsyncThunk(
  "masterConfiguration/create",
  async ({ module, data }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseUrl}/master-config/${module}`, data, authConfig());
      return { module, record: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Unable to save configuration");
    }
  }
);

// Update existing record
export const updateMasterConfig = createAsyncThunk(
  "masterConfiguration/update",
  async ({ module, id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${baseUrl}/master-config/${module}/${id}`, data, authConfig());
      return { module, id, record: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Unable to update configuration");
    }
  }
);

// Delete record
export const deleteMasterConfig = createAsyncThunk(
  "masterConfiguration/delete",
  async ({ module, id }, { rejectWithValue }) => {
    try {
      await axios.delete(`${baseUrl}/master-config/${module}/${id}`, authConfig());
      return { module, id };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Unable to remove configuration");
    }
  }
);

// Selector helper to get module data
const getModuleState = (state, module) => {
  const moduleState = state.modules[module];
  if (!moduleState) return { records: [], loading: false, error: null };
  return moduleState;
};

const slice = createSlice({
  name: "masterConfiguration",
  initialState: {
    sessions: [],
    loading: false,
    error: null,
    modules: {}, // Generic storage for other modules
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchMasterConfig.pending, (state, action) => {
      const module = action.meta.arg;
      if (module === "session") {
        state.loading = true;
        state.error = null;
      } else {
        state.modules[module] = { records: [], loading: true, error: null };
      }
    });
    builder.addCase(fetchMasterConfig.fulfilled, (state, action) => {
      const { module, records } = action.payload;
      if (module === "session") {
        state.sessions = records;
        state.loading = false;
      } else {
        state.modules[module] = { records, loading: false, error: null };
      }
    });
    builder.addCase(fetchMasterConfig.rejected, (state, action) => {
      const failure = action.payload;
      if (failure?.module === "session") {
        state.loading = false;
        state.error = failure.message;
      } else if (failure) {
        state.modules[failure.module] = { records: [], loading: false, error: failure.message };
      }
    });

    // Create
    builder.addCase(createMasterConfig.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createMasterConfig.fulfilled, (state, action) => {
      const { module, record } = action.payload;
      if (module === "session") {
        state.sessions = [record, ...state.sessions];
        state.loading = false;
      } else {
        const current = state.modules[module] || { records: [] };
        current.records = [record, ...current.records];
        state.modules[module] = { ...current, loading: false };
      }
    });
    builder.addCase(createMasterConfig.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to create";
    });

    // Update
    builder.addCase(updateMasterConfig.fulfilled, (state, action) => {
      const { module, id, record } = action.payload;
      if (module === "session") {
        const index = state.sessions.findIndex((s) => s._id === id);
        if (index !== -1) state.sessions[index] = record;
      } else {
        const current = state.modules[module];
        if (current) {
          const index = current.records.findIndex((r) => r._id === id);
          if (index !== -1) current.records[index] = record;
        }
      }
    });

    // Delete
    builder.addCase(deleteMasterConfig.fulfilled, (state, action) => {
      const { module, id } = action.payload;
      if (module === "session") {
        state.sessions = state.sessions.filter((s) => s._id !== id);
      } else {
        const current = state.modules[module];
        if (current) {
          current.records = current.records.filter((r) => r._id !== id);
        }
      }
    });
  },
});

export default slice.reducer;
