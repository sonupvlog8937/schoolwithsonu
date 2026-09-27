import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const fetchCategories = createAsyncThunk("studentSettings/fetchCategories",
  async (search = '', { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/student-settings/categories", { params: { search } });
      return res.data.data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
  }
);
export const addCategory = createAsyncThunk("studentSettings/addCategory",
  async (name, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/student-settings/categories", { name });
      return res.data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
  }
);
export const updateCategory = createAsyncThunk("studentSettings/updateCategory",
  async ({ id, name }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/student-settings/categories/${id}`, { name });
      return res.data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
  }
);
export const deleteCategory = createAsyncThunk("studentSettings/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/student-settings/categories/${id}`);
      return id;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
  }
);

// ─── HOUSES ───────────────────────────────────────────────────────────────────
export const fetchHouses = createAsyncThunk("studentSettings/fetchHouses",
  async (search = '', { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/student-settings/houses", { params: { search } });
      return res.data.data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
  }
);
export const addHouse = createAsyncThunk("studentSettings/addHouse",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/student-settings/houses", data);
      return res.data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
  }
);
export const updateHouse = createAsyncThunk("studentSettings/updateHouse",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/student-settings/houses/${id}`, data);
      return res.data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
  }
);
export const deleteHouse = createAsyncThunk("studentSettings/deleteHouse",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/student-settings/houses/${id}`);
      return id;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
  }
);

// ─── DISABLE REASONS ──────────────────────────────────────────────────────────
export const fetchDisableReasons = createAsyncThunk("studentSettings/fetchDisableReasons",
  async (search = '', { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/student-settings/disable-reasons", { params: { search } });
      return res.data.data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
  }
);
export const addDisableReason = createAsyncThunk("studentSettings/addDisableReason",
  async (reason, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/student-settings/disable-reasons", { reason });
      return res.data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
  }
);
export const updateDisableReason = createAsyncThunk("studentSettings/updateDisableReason",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/student-settings/disable-reasons/${id}`, { reason });
      return res.data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
  }
);
export const deleteDisableReason = createAsyncThunk("studentSettings/deleteDisableReason",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/student-settings/disable-reasons/${id}`);
      return id;
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
  }
);

// ─── SLICE ────────────────────────────────────────────────────────────────────
const studentSettingsSlice = createSlice({
  name: "studentSettings",
  initialState: {
    categories: [],
    houses: [],
    disableReasons: [],
    loading: false,
    submitLoading: false,
    error: null,
    successMsg: null,
  },
  reducers: {
    clearSettingsMessages(state) {
      state.error = null;
      state.successMsg = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const submitPending = (state) => { state.submitLoading = true; state.error = null; state.successMsg = null; };
    const rejected = (state, action) => { state.loading = false; state.submitLoading = false; state.error = action.payload; };

    // Categories
    builder
      .addCase(fetchCategories.pending, pending)
      .addCase(fetchCategories.fulfilled, (state, action) => { state.loading = false; state.categories = action.payload; })
      .addCase(fetchCategories.rejected, rejected)
      .addCase(addCategory.pending, submitPending)
      .addCase(addCategory.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message;
        state.categories.unshift(action.payload.data);
      })
      .addCase(addCategory.rejected, rejected)
      .addCase(updateCategory.pending, submitPending)
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message;
        const idx = state.categories.findIndex(c => c._id === action.payload.data._id);
        if (idx !== -1) state.categories[idx] = action.payload.data;
      })
      .addCase(updateCategory.rejected, rejected)
      .addCase(deleteCategory.pending, submitPending)
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = "Category deleted successfully";
        state.categories = state.categories.filter(c => c._id !== action.payload);
      })
      .addCase(deleteCategory.rejected, rejected);

    // Houses
    builder
      .addCase(fetchHouses.pending, pending)
      .addCase(fetchHouses.fulfilled, (state, action) => { state.loading = false; state.houses = action.payload; })
      .addCase(fetchHouses.rejected, rejected)
      .addCase(addHouse.pending, submitPending)
      .addCase(addHouse.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message;
        state.houses.unshift(action.payload.data);
      })
      .addCase(addHouse.rejected, rejected)
      .addCase(updateHouse.pending, submitPending)
      .addCase(updateHouse.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message;
        const idx = state.houses.findIndex(h => h._id === action.payload.data._id);
        if (idx !== -1) state.houses[idx] = action.payload.data;
      })
      .addCase(updateHouse.rejected, rejected)
      .addCase(deleteHouse.pending, submitPending)
      .addCase(deleteHouse.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = "House deleted successfully";
        state.houses = state.houses.filter(h => h._id !== action.payload);
      })
      .addCase(deleteHouse.rejected, rejected);

    // Disable Reasons
    builder
      .addCase(fetchDisableReasons.pending, pending)
      .addCase(fetchDisableReasons.fulfilled, (state, action) => { state.loading = false; state.disableReasons = action.payload; })
      .addCase(fetchDisableReasons.rejected, rejected)
      .addCase(addDisableReason.pending, submitPending)
      .addCase(addDisableReason.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message;
        state.disableReasons.unshift(action.payload.data);
      })
      .addCase(addDisableReason.rejected, rejected)
      .addCase(updateDisableReason.pending, submitPending)
      .addCase(updateDisableReason.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message;
        const idx = state.disableReasons.findIndex(d => d._id === action.payload.data._id);
        if (idx !== -1) state.disableReasons[idx] = action.payload.data;
      })
      .addCase(updateDisableReason.rejected, rejected)
      .addCase(deleteDisableReason.pending, submitPending)
      .addCase(deleteDisableReason.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = "Disable reason deleted successfully";
        state.disableReasons = state.disableReasons.filter(d => d._id !== action.payload);
      })
      .addCase(deleteDisableReason.rejected, rejected);
  },
});

export const { clearSettingsMessages } = studentSettingsSlice.actions;
export default studentSettingsSlice.reducer;
