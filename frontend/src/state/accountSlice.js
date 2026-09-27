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

export const fetchAccount = createAsyncThunk("account/fetch", async (resource, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/account/${resource}`, config());
    return { resource, records: response.data.data || [], summary: response.data.summary || {} };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to load account records");
  }
});

export const createAccount = createAsyncThunk("account/create", async ({ resource, data }, { rejectWithValue }) => {
  try {
    return (await axios.post(`${baseUrl}/account/${resource}`, data, config())).data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to save account record");
  }
});

export const deleteAccount = createAsyncThunk("account/delete", async ({ resource, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`${baseUrl}/account/${resource}/${id}`, config());
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to remove account record");
  }
});

const slice = createSlice({
  name: "account",
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
    clearAccountNotice: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.resource = action.payload.resource;
        state.records = action.payload.records;
        state.summary = action.payload.summary;
      })
      .addCase(fetchAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAccount.pending, (state) => {
        state.saving = true;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.saving = false;
        state.records.unshift(action.payload);
        state.success = "Saved successfully";
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.records = state.records.filter((record) => record._id !== action.payload);
        state.success = "Removed successfully";
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearAccountNotice } = slice.actions;
export default slice.reducer;
