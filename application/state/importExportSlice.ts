import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchImportExport = createAsyncThunk('importExport/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/import-export-resource/${resource}`);
  return { resource, records: response?.data ?? [] };
});

export const createImportExport = createAsyncThunk(
  'importExport/create',
  async ({ resource, data }: { resource: string; data: Record<string, unknown> }) => postData(`/import-export-resource/${resource}`, data)
);

export const deleteImportExport = createAsyncThunk('importExport/delete', async ({ resource, id }: { resource: string; id: string }) => {
  await deleteData(`/import-export-resource/${resource}/${id}`);
  return id;
});

const slice = createSlice({
  name: 'importExport',
  initialState: { resource: '', records: [] as any[], loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchImportExport.pending, (state) => { state.loading = true; })
      .addCase(fetchImportExport.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchImportExport.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Unable to load import/export records'; })
      .addCase(createImportExport.fulfilled, (state, action) => { if (action.payload?.data) state.records.unshift(action.payload.data); })
      .addCase(deleteImportExport.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); });
  },
});

export default slice.reducer;
