import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../environment";

const config = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` } };
};

export const fetchAcademicContent = createAsyncThunk("academicContent/fetch", async (resource, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/academic-content-resource/${resource}`, config());
    return { resource, records: response.data.data || [] };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to load academic content records");
  }
});

export const createAcademicContent = createAsyncThunk("academicContent/create", async ({ resource, data }, { rejectWithValue }) => {
  try {
    return (await axios.post(`${baseUrl}/academic-content-resource/${resource}`, data, config())).data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to save academic content record");
  }
});

export const deleteAcademicContent = createAsyncThunk("academicContent/delete", async ({ resource, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`${baseUrl}/academic-content-resource/${resource}/${id}`, config());
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to remove academic content record");
  }
});

const slice = createSlice({
  name: "academicContent",
  initialState: { resource: "", records: [], loading: false, saving: false, error: null, success: null },
  reducers: { clearAcademicContentNotice: (state) => { state.error = null; state.success = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAcademicContent.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAcademicContent.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchAcademicContent.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createAcademicContent.pending, (state) => { state.saving = true; })
      .addCase(createAcademicContent.fulfilled, (state, action) => { state.saving = false; state.records.unshift(action.payload); state.success = "Saved successfully"; })
      .addCase(createAcademicContent.rejected, (state, action) => { state.saving = false; state.error = action.payload; })
      .addCase(deleteAcademicContent.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); state.success = "Removed successfully"; })
      .addCase(deleteAcademicContent.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearAcademicContentNotice } = slice.actions;
export default slice.reducer;
