import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../environment";

const config = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` } };
};

export const fetchBehaviour = createAsyncThunk("behaviour/fetch", async (resource, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/behaviour-resource/${resource}`, config());
    return { resource, records: response.data.data || [] };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to load behaviour records");
  }
});

export const createBehaviour = createAsyncThunk("behaviour/create", async ({ resource, data }, { rejectWithValue }) => {
  try {
    return (await axios.post(`${baseUrl}/behaviour-resource/${resource}`, data, config())).data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to save behaviour record");
  }
});

export const deleteBehaviour = createAsyncThunk("behaviour/delete", async ({ resource, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`${baseUrl}/behaviour-resource/${resource}/${id}`, config());
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to remove behaviour record");
  }
});

const slice = createSlice({
  name: "behaviour",
  initialState: { resource: "", records: [], loading: false, saving: false, error: null, success: null },
  reducers: { clearBehaviourNotice: (state) => { state.error = null; state.success = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBehaviour.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBehaviour.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchBehaviour.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createBehaviour.pending, (state) => { state.saving = true; })
      .addCase(createBehaviour.fulfilled, (state, action) => { state.saving = false; state.records.unshift(action.payload); state.success = "Saved successfully"; })
      .addCase(createBehaviour.rejected, (state, action) => { state.saving = false; state.error = action.payload; })
      .addCase(deleteBehaviour.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); state.success = "Removed successfully"; })
      .addCase(deleteBehaviour.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearBehaviourNotice } = slice.actions;
export default slice.reducer;
