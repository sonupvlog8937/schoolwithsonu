import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchReport = createAsyncThunk('report/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/report-resource/${resource}`);
  return { resource, records: response?.data ?? [], summary: response?.summary ?? {} };
});

export const createReport = createAsyncThunk(
  'report/create',
  async ({ resource, data }: { resource: string; data: Record<string, unknown> }) => postData(`/report-resource/${resource}`, data)
);

export const deleteReport = createAsyncThunk('report/delete', async ({ resource, id }: { resource: string; id: string }) => {
  await deleteData(`/report-resource/${resource}/${id}`);
  return id;
});

const slice = createSlice({
  name: 'report',
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
      .addCase(fetchReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.loading = false;
        state.resource = action.payload.resource;
        state.records = action.payload.records;
        state.summary = action.payload.summary;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Unable to load report records';
      })
      .addCase(createReport.fulfilled, (state, action) => {
        if (action.payload?.data) state.records.unshift(action.payload.data);
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.records = state.records.filter((record) => record._id !== action.payload);
      });
  },
});

export default slice.reducer;
