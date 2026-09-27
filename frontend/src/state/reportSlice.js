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

export const fetchReport = createAsyncThunk("report/fetch", async (resource, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/report-resource/${resource}`, config());
    return { resource, records: response.data.data || [], summary: response.data.summary || {} };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to load report records");
  }
});

export const createReport = createAsyncThunk("report/create", async ({ resource, data }, { rejectWithValue }) => {
  try {
    return (await axios.post(`${baseUrl}/report-resource/${resource}`, data, config())).data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to save report record");
  }
});

export const deleteReport = createAsyncThunk("report/delete", async ({ resource, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`${baseUrl}/report-resource/${resource}/${id}`, config());
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to remove report record");
  }
});

const slice = createSlice({
  name: "report",
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
    clearReportNotice: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.loading = false;
        state.resource = action.payload.resource;
        state.records = action.payload.records;
        state.summary = action.payload.summary;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createReport.pending, (state) => {
        state.saving = true;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.saving = false;
        state.records.unshift(action.payload);
        state.success = "Saved successfully";
      })
      .addCase(createReport.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.records = state.records.filter((record) => record._id !== action.payload);
        state.success = "Removed successfully";
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearReportNotice } = slice.actions;
export default slice.reducer;
