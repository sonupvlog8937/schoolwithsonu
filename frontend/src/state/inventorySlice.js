import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../environment";

const config = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}`,
    },
  };
};

export const fetchInventory = createAsyncThunk("inventory/fetch", async (resource, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/inventory/${resource}`, config());
    return { resource, records: response.data.data || [], summary: response.data.summary || {} };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to load inventory records");
  }
});

export const createInventory = createAsyncThunk("inventory/create", async ({ resource, data }, { rejectWithValue }) => {
  try {
    return (await axios.post(`${baseUrl}/inventory/${resource}`, data, config())).data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to save inventory record");
  }
});

export const deleteInventory = createAsyncThunk("inventory/delete", async ({ resource, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`${baseUrl}/inventory/${resource}/${id}`, config());
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to remove inventory record");
  }
});

const slice = createSlice({
  name: "inventory",
  initialState: {
    resource: "",
    records: [],
    summary: {},
    loading: false,
    saving: false,
    error: null,
    success: null,
  },
  reducers: {
    clearInventoryNotice: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.resource = action.payload.resource;
        state.records = action.payload.records;
        state.summary = action.payload.summary;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createInventory.pending, (state) => {
        state.saving = true;
      })
      .addCase(createInventory.fulfilled, (state, action) => {
        state.saving = false;
        state.records.unshift(action.payload);
        state.success = "Saved successfully";
      })
      .addCase(createInventory.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(deleteInventory.fulfilled, (state, action) => {
        state.records = state.records.filter((record) => record._id !== action.payload);
        state.success = "Removed successfully";
      })
      .addCase(deleteInventory.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearInventoryNotice } = slice.actions;
export default slice.reducer;
