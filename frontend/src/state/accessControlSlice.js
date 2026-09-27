import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../environment";

const config = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` } };
};

export const fetchAccessControl = createAsyncThunk("accessControl/fetch", async (resource, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/access-control-resource/${resource}`, config());
    return { resource, records: response.data.data || [] };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to load access control records");
  }
});

export const createAccessControl = createAsyncThunk("accessControl/create", async ({ resource, data }, { rejectWithValue }) => {
  try {
    return (await axios.post(`${baseUrl}/access-control-resource/${resource}`, data, config())).data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to save access control record");
  }
});

export const deleteAccessControl = createAsyncThunk("accessControl/delete", async ({ resource, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`${baseUrl}/access-control-resource/${resource}/${id}`, config());
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to remove access control record");
  }
});

const slice = createSlice({
  name: "accessControl",
  initialState: { resource: "", records: [], loading: false, saving: false, error: null, success: null },
  reducers: { clearAccessControlNotice: (state) => { state.error = null; state.success = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccessControl.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAccessControl.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchAccessControl.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createAccessControl.pending, (state) => { state.saving = true; })
      .addCase(createAccessControl.fulfilled, (state, action) => { state.saving = false; state.records.unshift(action.payload); state.success = "Saved successfully"; })
      .addCase(createAccessControl.rejected, (state, action) => { state.saving = false; state.error = action.payload; })
      .addCase(deleteAccessControl.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); state.success = "Removed successfully"; })
      .addCase(deleteAccessControl.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearAccessControlNotice } = slice.actions;
export default slice.reducer;
