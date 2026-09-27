import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../environment";

const config = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` } };
};

export const fetchOnlineClass = createAsyncThunk("onlineClass/fetch", async (resource, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/online-class-resource/${resource}`, config());
    return { resource, records: response.data.data || [] };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to load online class records");
  }
});

export const createOnlineClass = createAsyncThunk("onlineClass/create", async ({ resource, data }, { rejectWithValue }) => {
  try {
    return (await axios.post(`${baseUrl}/online-class-resource/${resource}`, data, config())).data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to save online class record");
  }
});

export const deleteOnlineClass = createAsyncThunk("onlineClass/delete", async ({ resource, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`${baseUrl}/online-class-resource/${resource}/${id}`, config());
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to remove online class record");
  }
});

const slice = createSlice({
  name: "onlineClass",
  initialState: { resource: "", records: [], loading: false, saving: false, error: null, success: null },
  reducers: { clearOnlineClassNotice: (state) => { state.error = null; state.success = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOnlineClass.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchOnlineClass.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchOnlineClass.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createOnlineClass.pending, (state) => { state.saving = true; })
      .addCase(createOnlineClass.fulfilled, (state, action) => { state.saving = false; state.records.unshift(action.payload); state.success = "Saved successfully"; })
      .addCase(createOnlineClass.rejected, (state, action) => { state.saving = false; state.error = action.payload; })
      .addCase(deleteOnlineClass.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); state.success = "Removed successfully"; })
      .addCase(deleteOnlineClass.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearOnlineClassNotice } = slice.actions;
export default slice.reducer;
