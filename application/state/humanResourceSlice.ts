import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchHumanResource = createAsyncThunk('humanResource/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/human-resource/${resource}`);
  return { resource, records: response?.data ?? [], summary: response?.summary ?? {} };
});

export const createHumanResource = createAsyncThunk(
  'humanResource/create',
  async ({ resource, data }: { resource: string; data: Record<string, unknown> }) => postData(`/human-resource/${resource}`, data)
);

export const deleteHumanResource = createAsyncThunk('humanResource/delete', async ({ resource, id }: { resource: string; id: string }) => {
  await deleteData(`/human-resource/${resource}/${id}`);
  return id;
});

const slice = createSlice({
  name: 'humanResource',
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
      .addCase(fetchHumanResource.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHumanResource.fulfilled, (state, action) => {
        state.loading = false;
        state.resource = action.payload.resource;
        state.records = action.payload.records;
        state.summary = action.payload.summary;
      })
      .addCase(fetchHumanResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Unable to load human resource records';
      })
      .addCase(createHumanResource.fulfilled, (state, action) => {
        if (action.payload?.data) state.records.unshift(action.payload.data);
      })
      .addCase(deleteHumanResource.fulfilled, (state, action) => {
        state.records = state.records.filter((record) => record._id !== action.payload);
      });
  },
});

export default slice.reducer;
