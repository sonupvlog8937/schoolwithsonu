import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchAcademicContent = createAsyncThunk('academicContent/fetch', async (resource: string) => {
  const response = await fetchDataFromApi(`/academic-content-resource/${resource}`);
  return { resource, records: response?.data ?? [] };
});

export const createAcademicContent = createAsyncThunk(
  'academicContent/create',
  async ({ resource, data }: { resource: string; data: Record<string, unknown> }) => postData(`/academic-content-resource/${resource}`, data)
);

export const deleteAcademicContent = createAsyncThunk('academicContent/delete', async ({ resource, id }: { resource: string; id: string }) => {
  await deleteData(`/academic-content-resource/${resource}/${id}`);
  return id;
});

const slice = createSlice({
  name: 'academicContent',
  initialState: { resource: '', records: [] as any[], loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAcademicContent.pending, (state) => { state.loading = true; })
      .addCase(fetchAcademicContent.fulfilled, (state, action) => { state.loading = false; state.resource = action.payload.resource; state.records = action.payload.records; })
      .addCase(fetchAcademicContent.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Unable to load academic content records'; })
      .addCase(createAcademicContent.fulfilled, (state, action) => { if (action.payload?.data) state.records.unshift(action.payload.data); })
      .addCase(deleteAcademicContent.fulfilled, (state, action) => { state.records = state.records.filter((record) => record._id !== action.payload); });
  },
});

export default slice.reducer;
