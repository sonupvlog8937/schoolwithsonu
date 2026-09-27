import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchAccount = createAsyncThunk('account/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/account/${resource}`);
  return { resource, records: response?.data ?? [], summary: response?.summary ?? {} };
});

export const createAccount = createAsyncThunk('account/create', async ({ resource, data }: { resource: string; data: Record<string, unknown> }) =>
  postData(`/account/${resource}`, data)
);

export const deleteAccount = createAsyncThunk('account/delete', async ({ resource, id }: { resource: string; id: string }) => {
  await deleteData(`/account/${resource}/${id}`);
  return id;
});

const slice = createSlice({
  name: 'account',
  initialState: {
    resource: '',
    records: [] as any[],
    summary: {} as Record<string, any>,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.resource = action.payload.resource;
        state.records = action.payload.records;
        state.summary = action.payload.summary;
      })
      .addCase(fetchAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Unable to load account records';
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        if (action.payload?.data) state.records.unshift(action.payload.data);
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.records = state.records.filter((record) => record._id !== action.payload);
      });
  },
});

export default slice.reducer;
