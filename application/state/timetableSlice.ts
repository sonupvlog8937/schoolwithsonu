import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchTimetable = createAsyncThunk('timetable/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/timetable-resource/${resource}`);
  return { resource, records: response?.data ?? [], summary: response?.summary ?? {} };
});

export const createTimetable = createAsyncThunk(
  'timetable/create',
  async ({ resource, data }: { resource: string; data: Record<string, unknown> }) => postData(`/timetable-resource/${resource}`, data)
);

export const deleteTimetable = createAsyncThunk('timetable/delete', async ({ resource, id }: { resource: string; id: string }) => {
  await deleteData(`/timetable-resource/${resource}/${id}`);
  return id;
});

const slice = createSlice({
  name: 'timetable',
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
      .addCase(fetchTimetable.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTimetable.fulfilled, (state, action) => {
        state.loading = false;
        state.resource = action.payload.resource;
        state.records = action.payload.records;
        state.summary = action.payload.summary;
      })
      .addCase(fetchTimetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Unable to load timetable records';
      })
      .addCase(createTimetable.fulfilled, (state, action) => {
        if (action.payload?.data) state.records.unshift(action.payload.data);
      })
      .addCase(deleteTimetable.fulfilled, (state, action) => {
        state.records = state.records.filter((record) => record._id !== action.payload);
      });
  },
});

export default slice.reducer;
