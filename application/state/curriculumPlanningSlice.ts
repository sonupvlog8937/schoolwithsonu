import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchCurriculumPlanning = createAsyncThunk('curriculumPlanning/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/curriculum-planning/${resource}`);
  return { resource, records: response?.data ?? [], summary: response?.summary ?? {} };
});

export const createCurriculumPlanning = createAsyncThunk(
  'curriculumPlanning/create',
  async ({ resource, data }: { resource: string; data: Record<string, unknown> }) => postData(`/curriculum-planning/${resource}`, data)
);

export const deleteCurriculumPlanning = createAsyncThunk('curriculumPlanning/delete', async ({ resource, id }: { resource: string; id: string }) => {
  await deleteData(`/curriculum-planning/${resource}/${id}`);
  return id;
});

const slice = createSlice({
  name: 'curriculumPlanning',
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
      .addCase(fetchCurriculumPlanning.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurriculumPlanning.fulfilled, (state, action) => {
        state.loading = false;
        state.resource = action.payload.resource;
        state.records = action.payload.records;
        state.summary = action.payload.summary;
      })
      .addCase(fetchCurriculumPlanning.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Unable to load curriculum planning records';
      })
      .addCase(createCurriculumPlanning.fulfilled, (state, action) => {
        if (action.payload?.data) state.records.unshift(action.payload.data);
      })
      .addCase(deleteCurriculumPlanning.fulfilled, (state, action) => {
        state.records = state.records.filter((record) => record._id !== action.payload);
      });
  },
});

export default slice.reducer;
