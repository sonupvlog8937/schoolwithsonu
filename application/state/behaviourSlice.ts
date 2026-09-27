import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchBehaviour = createAsyncThunk('behaviour/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/behaviour-resource/${resource}`);
  return { resource, records: response?.data ?? [] };
});

export const createBehaviour = createAsyncThunk(
  'behaviour/create',
  async ({ resource, data }: { resource: string; data: Record<string, unknown> }) => postData(`/behaviour-resource/${resource}`, data)
);

export const deleteBehaviour = createAsyncThunk('behaviour/delete', async ({ resource, id }: { resource: string; id: string }) => {
  await deleteData(`/behaviour-resource/${resource}/${id}`);
  return id;
});

const slice = createSlice({
  name: 'behaviour',
  initialState: { resource: '', records: [] as any[], loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBehaviour.pending, (state) => { state.loading = true; })
      .addCase(fetchBehaviour.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchBehaviour.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Unable to load behaviour records'; })
      .addCase(createBehaviour.fulfilled, (state, action) => { if (action.payload?.data) state.records.unshift(action.payload.data); })
      .addCase(deleteBehaviour.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); });
  },
});

export default slice.reducer;
