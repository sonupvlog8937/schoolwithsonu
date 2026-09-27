import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchOnlineClass = createAsyncThunk('onlineClass/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/online-class-resource/${resource}`);
  return { resource, records: response?.data ?? [] };
});

export const createOnlineClass = createAsyncThunk(
  'onlineClass/create',
  async ({ resource, data }: { resource: string; data: Record<string, unknown> }) => postData(`/online-class-resource/${resource}`, data)
);

export const deleteOnlineClass = createAsyncThunk('onlineClass/delete', async ({ resource, id }: { resource: string; id: string }) => {
  await deleteData(`/online-class-resource/${resource}/${id}`);
  return id;
});

const slice = createSlice({
  name: 'onlineClass',
  initialState: { resource: '', records: [] as any[], loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOnlineClass.pending, (state) => { state.loading = true; })
      .addCase(fetchOnlineClass.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchOnlineClass.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Unable to load online class records'; })
      .addCase(createOnlineClass.fulfilled, (state, action) => { if (action.payload?.data) state.records.unshift(action.payload.data); })
      .addCase(deleteOnlineClass.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); });
  },
});

export default slice.reducer;
