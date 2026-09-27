import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchDataFromApi } from '@/utils/api';

export type DashboardType = 'follow-up' | 'complaint' | 'visitor' | 'chat' | 'user-activity';
export type DashboardRequest = DashboardType | { type: DashboardType; days?: number; page?: number; limit?: number; search?: string; role?: string; status?: string };
export type SchoolDashboardState = { data: any; loading: boolean; error: string | null };
const initialState: Record<DashboardType, SchoolDashboardState> = {
  'follow-up': { data: null, loading: false, error: null }, complaint: { data: null, loading: false, error: null }, visitor: { data: null, loading: false, error: null }, chat: { data: null, loading: false, error: null }, 'user-activity': { data: null, loading: false, error: null },
};

export const fetchSchoolDashboard = createAsyncThunk<{ type: DashboardType; data: any }, DashboardRequest, { rejectValue: { type: DashboardType; message: string } }>('schoolDashboards/fetch', async (request, { rejectWithValue }) => {
  const type = typeof request === 'string' ? request : request.type;
  const options = typeof request === 'string' ? undefined : request;
  const query = Object.entries({ days: options?.days, page: options?.page, limit: options?.limit, search: options?.search, role: options?.role, status: options?.status }).reduce<Record<string, string>>((result, [key, value]) => {
    if (value !== undefined && value !== 'all' && value !== '') result[key] = String(value);
    return result;
  }, {});
  const params = new URLSearchParams(query);
  const response = await fetchDataFromApi(`/dashboard/${type}${params.toString() ? `?${params.toString()}` : ''}`);
  if (response?.error || !response?.success) return rejectWithValue({ type, message: response?.message || 'Unable to load dashboard' });
  return { type, data: response.data };
});

const slice = createSlice({ name: 'schoolDashboards', initialState, reducers: {}, extraReducers: (builder) => {
  builder.addCase(fetchSchoolDashboard.pending, (state, action) => { const type = typeof action.meta.arg === 'string' ? action.meta.arg : action.meta.arg.type; state[type].loading = true; state[type].error = null; });
  builder.addCase(fetchSchoolDashboard.fulfilled, (state, action) => { state[action.payload.type] = { data: action.payload.data, loading: false, error: null }; });
  builder.addCase(fetchSchoolDashboard.rejected, (state, action) => { const failure = action.payload; if (failure) state[failure.type] = { data: null, loading: false, error: failure.message }; });
}});
export default slice.reducer;
