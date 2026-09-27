import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchExam = createAsyncThunk('exam/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/exam/${resource}`);
  return { resource, records: response?.data ?? [] };
});

export const createExam = createAsyncThunk('exam/create', async ({ resource, data }: { resource: string; data: Record<string, unknown> }) =>
  postData(`/exam/${resource}`, data)
);

export const deleteExam = createAsyncThunk('exam/delete', async ({ resource, id }: { resource: string; id: string }) => {
  await deleteData(`/exam/${resource}/${id}`);
  return id;
});

const slice = createSlice({
  name: 'exam',
  initialState: {
    resource: '',
    records: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExam.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExam.fulfilled, (state, action) => {
        state.loading = false;
        state.resource = action.payload.resource;
        state.records = action.payload.records;
      })
      .addCase(fetchExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Unable to load exam records';
      })
      .addCase(createExam.fulfilled, (state, action) => {
        if (action.payload?.data) state.records.unshift(action.payload.data);
      })
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.records = state.records.filter((record) => record._id !== action.payload);
      });
  },
});

export default slice.reducer;
