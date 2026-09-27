import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchHostel = createAsyncThunk('hostel/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/hostel-resource/${resource}`);
  return { resource, records: response?.data ?? [] };
});

export const createHostel = createAsyncThunk(
  'hostel/create',
  async ({ resource, data }: { resource: string; data: Record<string, unknown> }) => postData(`/hostel-resource/${resource}`, data)
);

export const deleteHostel = createAsyncThunk('hostel/delete', async ({ resource, id }: { resource: string; id: string }) => {
  await deleteData(`/hostel-resource/${resource}/${id}`);
  return id;
});

const slice = createSlice({
  name: 'hostel',
  initialState: { resource: '', records: [] as any[], loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHostel.pending, (state) => { state.loading = true; })
      .addCase(fetchHostel.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchHostel.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Unable to load hostel records'; })
      .addCase(createHostel.fulfilled, (state, action) => { if (action.payload?.data) state.records.unshift(action.payload.data); })
      .addCase(deleteHostel.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); });
  },
});

export default slice.reducer;
