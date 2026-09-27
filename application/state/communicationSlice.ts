import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchCommunication = createAsyncThunk('communication/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/communicate/${resource}`);
  return { resource, records: response?.data ?? [] };
});
export const createCommunication = createAsyncThunk('communication/create', async ({ resource, data }: { resource: string; data: Record<string, unknown> }) => postData(`/communicate/${resource}`, data));
export const deleteCommunication = createAsyncThunk('communication/delete', async ({ resource, id }: { resource: string; id: string }) => { await deleteData(`/communicate/${resource}/${id}`); return id; });

const slice = createSlice({
  name: 'communication',
  initialState: { resource: '', records: [] as any[], loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCommunication.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchCommunication.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; });
    builder.addCase(fetchCommunication.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Unable to load records'; });
    builder.addCase(createCommunication.fulfilled, (state, action) => { if (action.payload?.data) state.records.unshift(action.payload.data); });
    builder.addCase(deleteCommunication.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); });
  },
});

export default slice.reducer;