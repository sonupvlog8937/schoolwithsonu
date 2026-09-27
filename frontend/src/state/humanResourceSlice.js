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

export const fetchHumanResource = createAsyncThunk("humanResource/fetch", async (resource, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/human-resource/${resource}`, config());
    return { resource, records: response.data.data || [], summary: response.data.summary || {} };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to load human resource records");
  }
});

export const createHumanResource = createAsyncThunk("humanResource/create", async ({ resource, data }, { rejectWithValue }) => {
  try {
    return (await axios.post(`${baseUrl}/human-resource/${resource}`, data, config())).data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to save human resource record");
  }
});

export const deleteHumanResource = createAsyncThunk("humanResource/delete", async ({ resource, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`${baseUrl}/human-resource/${resource}/${id}`, config());
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to remove human resource record");
  }
});

const slice = createSlice({
  name: "humanResource",
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
    clearHumanResourceNotice: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHumanResource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHumanResource.fulfilled, (state, action) => {
        state.loading = false;
        state.resource = action.payload.resource;
        state.records = action.payload.records;
        state.summary = action.payload.summary;
      })
      .addCase(fetchHumanResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createHumanResource.pending, (state) => {
        state.saving = true;
      })
      .addCase(createHumanResource.fulfilled, (state, action) => {
        state.saving = false;
        state.records.unshift(action.payload);
        state.success = "Saved successfully";
      })
      .addCase(createHumanResource.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(deleteHumanResource.fulfilled, (state, action) => {
        state.records = state.records.filter((record) => record._id !== action.payload);
        state.success = "Removed successfully";
      })
      .addCase(deleteHumanResource.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearHumanResourceNotice } = slice.actions;
export default slice.reducer;
