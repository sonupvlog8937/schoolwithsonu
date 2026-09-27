import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchParentAccount = createAsyncThunk('parentAccount/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/parent-account-resource/${resource}`);
  return { resource, records: response?.data ?? [] };
});

export const createParentAccount = createAsyncThunk(
  'parentAccount/create',
  async ({ resource, data }: { resource: string; data: Record<string, unknown> }) => postData(`/parent-account-resource/${resource}`, data)
);

export const deleteParentAccount = createAsyncThunk('parentAccount/delete', async ({ resource, id }: { resource: string; id: string }) => {
  await deleteData(`/parent-account-resource/${resource}/${id}`);
  return id;
});

const slice = createSlice({
  name: 'parentAccount',
  initialState: { resource: '', records: [] as any[], loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchParentAccount.pending, (state) => { state.loading = true; })
      .addCase(fetchParentAccount.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchParentAccount.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Unable to load parent account records'; })
      .addCase(createParentAccount.fulfilled, (state, action) => { if (action.payload?.data) state.records.unshift(action.payload.data); })
      .addCase(deleteParentAccount.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); });
  },
});

export default slice.reducer;
