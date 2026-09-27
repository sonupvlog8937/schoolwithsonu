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

export const fetchLeave = createAsyncThunk("leave/fetch", async (resource, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/leave-resource/${resource}`, config());
    return { resource, records: response.data.data || [], summary: response.data.summary || {} };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to load leave records");
  }
});

export const createLeave = createAsyncThunk("leave/create", async ({ resource, data }, { rejectWithValue }) => {
  try {
    return (await axios.post(`${baseUrl}/leave-resource/${resource}`, data, config())).data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to save leave record");
  }
});

export const deleteLeave = createAsyncThunk("leave/delete", async ({ resource, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`${baseUrl}/leave-resource/${resource}/${id}`, config());
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to remove leave record");
  }
});

const slice = createSlice({
  name: "leave",
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
    clearLeaveNotice: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.resource = action.payload.resource;
        state.records = action.payload.records;
        state.summary = action.payload.summary;
      })
      .addCase(fetchLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createLeave.pending, (state) => {
        state.saving = true;
      })
      .addCase(createLeave.fulfilled, (state, action) => {
        state.saving = false;
        state.records.unshift(action.payload);
        state.success = "Saved successfully";
      })
      .addCase(createLeave.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(deleteLeave.fulfilled, (state, action) => {
        state.records = state.records.filter((record) => record._id !== action.payload);
        state.success = "Removed successfully";
      })
      .addCase(deleteLeave.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearLeaveNotice } = slice.actions;
export default slice.reducer;
