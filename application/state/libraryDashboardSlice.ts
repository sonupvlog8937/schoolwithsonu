import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchDataFromApi } from '@/utils/api';

export type LibraryDashboard = {
  totalBooks: number;
  issuedBooks: number;
  returnedBooks: number;
  availableBooks: number;
  overdueBooks: number;
  titleCount: number;
};

const initialState: { data: LibraryDashboard | null; loading: boolean; error: string | null } = {
  data: null,
  loading: false,
  error: null,
};

export const fetchLibraryDashboard = createAsyncThunk<LibraryDashboard, void, { rejectValue: string }>(
  'libraryDashboard/fetch',
  async (_, { rejectWithValue }) => {
    const response = await fetchDataFromApi('/library/dashboard');
    if (response?.error || !response?.success) {
      return rejectWithValue(response?.message || 'Unable to load library dashboard');
    }

    return response?.data ?? response ?? {
      totalBooks: 0,
      issuedBooks: 0,
      returnedBooks: 0,
      availableBooks: 0,
      overdueBooks: 0,
      titleCount: 0,
    };
  },
);

const libraryDashboardSlice = createSlice({
  name: 'libraryDashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLibraryDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLibraryDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchLibraryDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to load library dashboard';
      });
  },
});

export default libraryDashboardSlice.reducer;
