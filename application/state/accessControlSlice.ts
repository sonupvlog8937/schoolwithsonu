import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchAccessControl = createAsyncThunk('accessControl/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/access-control-resource/${resource}`);
  return { resource, records: response?.data ?? [] };
});

export const createAccessControl = createAsyncThunk(
  'accessControl/create',
  async ({ resource, data }: { resource: string; data: Record<string, unknown> }) => postData(`/access-control-resource/${resource}`, data)
);

export const deleteAccessControl = createAsyncThunk('accessControl/delete', async ({ resource, id }: { resource: string; id: string }) => {
  await deleteData(`/access-control-resource/${resource}/${id}`);
  return id;
});

const slice = createSlice({
  name: 'accessControl',
  initialState: { resource: '', records: [] as any[], loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccessControl.pending, (state) => { state.loading = true; })
      .addCase(fetchAccessControl.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchAccessControl.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Unable to load access control records'; })
      .addCase(createAccessControl.fulfilled, (state, action) => { if (action.payload?.data) state.records.unshift(action.payload.data); })
      .addCase(deleteAccessControl.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); });
  },
});

export default slice.reducer;
