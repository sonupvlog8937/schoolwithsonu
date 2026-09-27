import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchWebsiteConfiguration = createAsyncThunk('websiteConfiguration/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/website-configuration-resource/${resource}`);
  return { resource, records: response?.data ?? [] };
});

export const createWebsiteConfiguration = createAsyncThunk(
  'websiteConfiguration/create',
  async ({ resource, data }: { resource: string; data: Record<string, unknown> }) => postData(`/website-configuration-resource/${resource}`, data)
);

export const deleteWebsiteConfiguration = createAsyncThunk('websiteConfiguration/delete', async ({ resource, id }: { resource: string; id: string }) => {
  await deleteData(`/website-configuration-resource/${resource}/${id}`);
  return id;
});

const slice = createSlice({
  name: 'websiteConfiguration',
  initialState: { resource: '', records: [] as any[], loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWebsiteConfiguration.pending, (state) => { state.loading = true; })
      .addCase(fetchWebsiteConfiguration.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchWebsiteConfiguration.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Unable to load website configuration records'; })
      .addCase(createWebsiteConfiguration.fulfilled, (state, action) => { if (action.payload?.data) state.records.unshift(action.payload.data); })
      .addCase(deleteWebsiteConfiguration.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); });
  },
});

export default slice.reducer;
