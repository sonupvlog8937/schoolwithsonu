import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseUrl } from '../environment';

// Async thunk to fetch school data
export const fetchSchoolData = createAsyncThunk(
  'school/fetchSchoolData',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${baseUrl}/school/fetch-single`, {
        headers: {
          Authorization: token,
        },
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch school data');
      }
    } catch (error) {
      console.error('Error fetching school data:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateSchoolData = createAsyncThunk(
  'school/updateSchoolData',
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${baseUrl}/school/update`, formData, {
        headers: { Authorization: token },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const schoolSlice = createSlice({
  name: 'school',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSchoolData: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
    setSchoolData: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchoolData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchoolData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchSchoolData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSchoolData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSchoolData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateSchoolData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSchoolData, setSchoolData } = schoolSlice.actions;
export default schoolSlice.reducer;
