import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchTransport = createAsyncThunk('transport/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/transport-resource/${resource}`);
  return { resource, records: response?.data ?? [] };
});

export const createTransport = createAsyncThunk(
  'transport/create',
  async ({ resource, data }: { resource: string; data: Record<string, unknown> }) => postData(`/transport-resource/${resource}`, data)
);

export const deleteTransport = createAsyncThunk('transport/delete', async ({ resource, id }: { resource: string; id: string }) => {
  await deleteData(`/transport-resource/${resource}/${id}`);
  return id;
});

const slice = createSlice({
  name: 'transport',
  initialState: { resource: '', records: [] as any[], loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransport.pending, (state) => { state.loading = true; })
      .addCase(fetchTransport.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchTransport.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Unable to load transport records'; })
      .addCase(createTransport.fulfilled, (state, action) => { if (action.payload?.data) state.records.unshift(action.payload.data); })
      .addCase(deleteTransport.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); });
  },
});

export default slice.reducer;
