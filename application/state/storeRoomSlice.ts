import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchStoreRoom = createAsyncThunk('storeRoom/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/store-room/${resource}`);
  return { resource, records: response?.data ?? [], summary: response?.summary ?? {} };
});

export const createStoreRoom = createAsyncThunk('storeRoom/create', async ({ resource, data }: { resource: string; data: Record<string, unknown> }) =>
  postData(`/store-room/${resource}`, data)
);

export const deleteStoreRoom = createAsyncThunk('storeRoom/delete', async ({ resource, id }: { resource: string; id: string }) => {
  await deleteData(`/store-room/${resource}/${id}`);
  return id;
});

const slice = createSlice({
  name: 'storeRoom',
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
      .addCase(fetchStoreRoom.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStoreRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.resource = action.payload.resource;
        state.records = action.payload.records;
        state.summary = action.payload.summary;
      })
      .addCase(fetchStoreRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Unable to load store room records';
      })
      .addCase(createStoreRoom.fulfilled, (state, action) => {
        if (action.payload?.data) state.records.unshift(action.payload.data);
      })
      .addCase(deleteStoreRoom.fulfilled, (state, action) => {
        state.records = state.records.filter((record) => record._id !== action.payload);
      });
  },
});

export default slice.reducer;
