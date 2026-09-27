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

export const fetchHostel = createAsyncThunk("hostel/fetch", async (resource, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/hostel-resource/${resource}`, config());
    return { resource, records: response.data.data || [] };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to load hostel records");
  }
});

export const createHostel = createAsyncThunk("hostel/create", async ({ resource, data }, { rejectWithValue }) => {
  try {
    return (await axios.post(`${baseUrl}/hostel-resource/${resource}`, data, config())).data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to save hostel record");
  }
});

export const deleteHostel = createAsyncThunk("hostel/delete", async ({ resource, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`${baseUrl}/hostel-resource/${resource}/${id}`, config());
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to remove hostel record");
  }
});

const slice = createSlice({
  name: "hostel",
  initialState: { resource: "", records: [], loading: false, saving: false, error: null, success: null },
  reducers: { clearHostelNotice: (state) => { state.error = null; state.success = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHostel.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchHostel.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchHostel.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createHostel.pending, (state) => { state.saving = true; })
      .addCase(createHostel.fulfilled, (state, action) => { state.saving = false; state.records.unshift(action.payload); state.success = "Saved successfully"; })
      .addCase(createHostel.rejected, (state, action) => { state.saving = false; state.error = action.payload; })
      .addCase(deleteHostel.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); state.success = "Removed successfully"; })
      .addCase(deleteHostel.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearHostelNotice } = slice.actions;
export default slice.reducer;
