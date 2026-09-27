import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../environment";

const config = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` } };
};

export const fetchParentAccount = createAsyncThunk("parentAccount/fetch", async (resource, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/parent-account-resource/${resource}`, config());
    return { resource, records: response.data.data || [] };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to load parent account records");
  }
});

export const createParentAccount = createAsyncThunk("parentAccount/create", async ({ resource, data }, { rejectWithValue }) => {
  try {
    return (await axios.post(`${baseUrl}/parent-account-resource/${resource}`, data, config())).data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to save parent account record");
  }
});

export const deleteParentAccount = createAsyncThunk("parentAccount/delete", async ({ resource, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`${baseUrl}/parent-account-resource/${resource}/${id}`, config());
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to remove parent account record");
  }
});

const slice = createSlice({
  name: "parentAccount",
  initialState: { resource: "", records: [], loading: false, saving: false, error: null, success: null },
  reducers: { clearParentAccountNotice: (state) => { state.error = null; state.success = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParentAccount.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchParentAccount.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchParentAccount.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createParentAccount.pending, (state) => { state.saving = true; })
      .addCase(createParentAccount.fulfilled, (state, action) => { state.saving = false; state.records.unshift(action.payload); state.success = "Saved successfully"; })
      .addCase(createParentAccount.rejected, (state, action) => { state.saving = false; state.error = action.payload; })
      .addCase(deleteParentAccount.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); state.success = "Removed successfully"; })
      .addCase(deleteParentAccount.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearParentAccountNotice } = slice.actions;
export default slice.reducer;
