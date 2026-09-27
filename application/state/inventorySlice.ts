import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchInventory = createAsyncThunk('inventory/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/inventory/${resource}`);
  return { resource, records: response?.data ?? [], summary: response?.summary ?? {} };
});

export const createInventory = createAsyncThunk('inventory/create', async ({ resource, data }: { resource: string; data: Record<string, unknown> }) =>
  postData(`/inventory/${resource}`, data)
);

export const deleteInventory = createAsyncThunk('inventory/delete', async ({ resource, id }: { resource: string; id: string }) => {
  await deleteData(`/inventory/${resource}/${id}`);
  return id;
});

const slice = createSlice({
  name: 'inventory',
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
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.resource = action.payload.resource;
        state.records = action.payload.records;
        state.summary = action.payload.summary;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Unable to load inventory records';
      })
      .addCase(createInventory.fulfilled, (state, action) => {
        if (action.payload?.data) state.records.unshift(action.payload.data);
      })
      .addCase(deleteInventory.fulfilled, (state, action) => {
        state.records = state.records.filter((record) => record._id !== action.payload);
      });
  },
});

export default slice.reducer;
