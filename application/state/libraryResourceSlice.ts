import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchLibraryResource = createAsyncThunk('libraryResource/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/library-resource/${resource}`);
  return { resource, records: response?.data ?? [] };
});

export const createLibraryResource = createAsyncThunk(
  'libraryResource/create',
  async ({ resource, data }: { resource: string; data: Record<string, unknown> }) => postData(`/library-resource/${resource}`, data)
);

export const deleteLibraryResource = createAsyncThunk('libraryResource/delete', async ({ resource, id }: { resource: string; id: string }) => {
  await deleteData(`/library-resource/${resource}/${id}`);
  return id;
});

const slice = createSlice({
  name: 'libraryResource',
  initialState: { resource: '', records: [] as any[], loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLibraryResource.pending, (state) => { state.loading = true; })
      .addCase(fetchLibraryResource.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchLibraryResource.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Unable to load library records'; })
      .addCase(createLibraryResource.fulfilled, (state, action) => { if (action.payload?.data) state.records.unshift(action.payload.data); })
      .addCase(deleteLibraryResource.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); });
  },
});

export default slice.reducer;
