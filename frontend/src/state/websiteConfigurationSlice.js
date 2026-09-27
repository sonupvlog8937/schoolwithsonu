import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../environment";

const config = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` } };
};

export const fetchWebsiteConfiguration = createAsyncThunk("websiteConfiguration/fetch", async (resource, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/website-configuration-resource/${resource}`, config());
    return { resource, records: response.data.data || [] };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to load website configuration records");
  }
});

export const createWebsiteConfiguration = createAsyncThunk("websiteConfiguration/create", async ({ resource, data }, { rejectWithValue }) => {
  try {
    return (await axios.post(`${baseUrl}/website-configuration-resource/${resource}`, data, config())).data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to save website configuration record");
  }
});

export const deleteWebsiteConfiguration = createAsyncThunk("websiteConfiguration/delete", async ({ resource, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`${baseUrl}/website-configuration-resource/${resource}/${id}`, config());
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to remove website configuration record");
  }
});

const slice = createSlice({
  name: "websiteConfiguration",
  initialState: { resource: "", records: [], loading: false, saving: false, error: null, success: null },
  reducers: { clearWebsiteConfigurationNotice: (state) => { state.error = null; state.success = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWebsiteConfiguration.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWebsiteConfiguration.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchWebsiteConfiguration.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createWebsiteConfiguration.pending, (state) => { state.saving = true; })
      .addCase(createWebsiteConfiguration.fulfilled, (state, action) => { state.saving = false; state.records.unshift(action.payload); state.success = "Saved successfully"; })
      .addCase(createWebsiteConfiguration.rejected, (state, action) => { state.saving = false; state.error = action.payload; })
      .addCase(deleteWebsiteConfiguration.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); state.success = "Removed successfully"; })
      .addCase(deleteWebsiteConfiguration.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearWebsiteConfigurationNotice } = slice.actions;
export default slice.reducer;
