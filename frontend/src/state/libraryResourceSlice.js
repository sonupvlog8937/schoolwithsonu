import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../environment";

const config = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` } };
};

export const fetchLibraryResource = createAsyncThunk("libraryResource/fetch", async (resource, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/library-resource/${resource}`, config());
    return { resource, records: response.data.data || [] };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to load library records");
  }
});

export const createLibraryResource = createAsyncThunk("libraryResource/create", async ({ resource, data }, { rejectWithValue }) => {
  try {
    return (await axios.post(`${baseUrl}/library-resource/${resource}`, data, config())).data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to save library record");
  }
});

export const deleteLibraryResource = createAsyncThunk("libraryResource/delete", async ({ resource, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`${baseUrl}/library-resource/${resource}/${id}`, config());
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to remove library record");
  }
});

const slice = createSlice({
  name: "libraryResource",
  initialState: { resource: "", records: [], loading: false, saving: false, error: null, success: null },
  reducers: { clearLibraryResourceNotice: (state) => { state.error = null; state.success = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLibraryResource.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchLibraryResource.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchLibraryResource.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createLibraryResource.pending, (state) => { state.saving = true; })
      .addCase(createLibraryResource.fulfilled, (state, action) => { state.saving = false; state.records.unshift(action.payload); state.success = "Saved successfully"; })
      .addCase(createLibraryResource.rejected, (state, action) => { state.saving = false; state.error = action.payload; })
      .addCase(deleteLibraryResource.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); state.success = "Removed successfully"; })
      .addCase(deleteLibraryResource.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearLibraryResourceNotice } = slice.actions;
export default slice.reducer;
