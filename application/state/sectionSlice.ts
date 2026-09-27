import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteData, editData, fetchDataFromApi, postData } from '@/utils/api';

export const fetchSections = createAsyncThunk('sections/fetch', async () => (await fetchDataFromApi('/sections'))?.data || []);
export const createSection = createAsyncThunk('sections/create', async (payload: { name: string; position: number }) => (await postData('/sections', payload))?.data);
export const updateSection = createAsyncThunk('sections/update', async ({ id, updates }: { id: string; updates: any }) => (await editData(`/sections/${id}`, updates))?.data);
export const deleteSection = createAsyncThunk('sections/delete', async (id: string) => { await deleteData(`/sections/${id}`); return id; });
export const saveSectionPositions = createAsyncThunk('sections/positions', async (sections: any[]) => { await editData('/sections/positions', { sections }); return sections; });
const slice = createSlice({ name: 'sections', initialState: { records: [] as any[], loading: false }, reducers: {}, extraReducers: (builder) => { builder.addCase(fetchSections.pending, (state) => { state.loading = true; }).addCase(fetchSections.fulfilled, (state, action) => { state.loading = false; state.records = action.payload; }).addCase(createSection.fulfilled, (state, action) => { state.records.push(action.payload); }).addCase(updateSection.fulfilled, (state, action) => { const index = state.records.findIndex((item) => item._id === action.payload._id); if (index >= 0) state.records[index] = action.payload; }).addCase(deleteSection.fulfilled, (state, action) => { state.records = state.records.filter((item) => item._id !== action.payload); }).addCase(saveSectionPositions.fulfilled, (state, action) => { action.payload.forEach((item) => { const record = state.records.find((row) => row._id === item.id); if (record) record.position = item.position; }); }); }});
export default slice.reducer;
