import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../environment";

const config = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` } };
};

export const fetchImportExport = createAsyncThunk("importExport/fetch", async (resource, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/import-export-resource/${resource}`, config());
    return { resource, records: response.data.data || [] };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to load import/export records");
  }
});

export const createImportExport = createAsyncThunk("importExport/create", async ({ resource, data }, { rejectWithValue }) => {
  try {
    return (await axios.post(`${baseUrl}/import-export-resource/${resource}`, data, config())).data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to save import/export record");
  }
});

export const deleteImportExport = createAsyncThunk("importExport/delete", async ({ resource, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`${baseUrl}/import-export-resource/${resource}/${id}`, config());
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to remove import/export record");
  }
});

const slice = createSlice({
  name: "importExport",
  initialState: { resource: "", records: [], loading: false, saving: false, error: null, success: null },
  reducers: { clearImportExportNotice: (state) => { state.error = null; state.success = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImportExport.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchImportExport.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchImportExport.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createImportExport.pending, (state) => { state.saving = true; })
      .addCase(createImportExport.fulfilled, (state, action) => { state.saving = false; state.records.unshift(action.payload); state.success = "Saved successfully"; })
      .addCase(createImportExport.rejected, (state, action) => { state.saving = false; state.error = action.payload; })
      .addCase(deleteImportExport.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); state.success = "Removed successfully"; })
      .addCase(deleteImportExport.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearImportExportNotice } = slice.actions;
export default slice.reducer;
