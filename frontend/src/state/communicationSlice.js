import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../environment";

const authConfig = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` } };
};

export const fetchCommunication = createAsyncThunk("communication/fetch", async (resource, { rejectWithValue }) => {
  try { return { resource, records: (await axios.get(`${baseUrl}/communicate/${resource}`, authConfig())).data.data || [] }; }
  catch (error) { return rejectWithValue(error.response?.data?.message || "Unable to load records"); }
});
export const createCommunication = createAsyncThunk("communication/create", async ({ resource, data }, { rejectWithValue }) => {
  try { return (await axios.post(`${baseUrl}/communicate/${resource}`, data, authConfig())).data.data; }
  catch (error) { return rejectWithValue(error.response?.data?.message || "Unable to save record"); }
});
export const deleteCommunication = createAsyncThunk("communication/delete", async ({ resource, id }, { rejectWithValue }) => {
  try { await axios.delete(`${baseUrl}/communicate/${resource}/${id}`, authConfig()); return id; }
  catch (error) { return rejectWithValue(error.response?.data?.message || "Unable to remove record"); }
});
export const sendCommunication = createAsyncThunk("communication/send", async (payload, { rejectWithValue }) => {
  try { return (await axios.post(`${baseUrl}/communicate/messages`, payload, authConfig())).data.data; }
  catch (error) { return rejectWithValue(error.response?.data?.message || "Unable to send message"); }
});

const slice = createSlice({
  name: "communication",
  initialState: { resource: "", records: [], loading: false, saving: false, error: null, success: null },
  reducers: { clearCommunicationNotice: (state) => { state.error = null; state.success = null; } },
  extraReducers: (builder) => {
    builder.addCase(fetchCommunication.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCommunication.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchCommunication.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createCommunication.pending, (state) => { state.saving = true; state.error = null; })
      .addCase(createCommunication.fulfilled, (state, action) => { state.saving = false; state.records.unshift(action.payload); state.success = "Saved successfully"; })
      .addCase(createCommunication.rejected, (state, action) => { state.saving = false; state.error = action.payload; })
      .addCase(deleteCommunication.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); state.success = "Removed successfully"; })
      .addCase(deleteCommunication.rejected, (state, action) => { state.error = action.payload; })
      .addCase(sendCommunication.pending, (state) => { state.saving = true; state.error = null; })
      .addCase(sendCommunication.fulfilled, (state) => { state.saving = false; state.success = "Message queued successfully"; })
      .addCase(sendCommunication.rejected, (state, action) => { state.saving = false; state.error = action.payload; });
  },
});

export const { clearCommunicationNotice } = slice.actions;
export default slice.reducer;