import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// Fetch Top 10 Schools (for homepage)
export const fetchTopSchools = createAsyncThunk(
  'publicSchool/fetchTopSchools',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/school/public/top');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch All Schools with Pagination (for "View All" page)
export const fetchAllSchools = createAsyncThunk(
  'publicSchool/fetchAllSchools',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 12, search = '' } = params;
      const res = await axios.get('/api/school/public/all', {
        params: { page, limit, search },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch Single School Details
export const fetchSchoolDetails = createAsyncThunk(
  'publicSchool/fetchSchoolDetails',
  async (schoolId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/school/public/${schoolId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Submit Online Admission Application
export const submitOnlineAdmission = createAsyncThunk(
  'publicSchool/submitOnlineAdmission',
  async (applicationData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/school/public/apply', applicationData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const publicSchoolSlice = createSlice({
  name: 'publicSchool',
  initialState: {
    // Top Schools (Homepage)
    topSchools: [],
    topSchoolsLoading: false,

    // All Schools (View All Page)
    allSchools: [],
    allSchoolsLoading: false,
    allSchoolsPagination: {
      total: 0,
      page: 1,
      limit: 12,
      pages: 0,
    },

    // School Details
    schoolDetails: null,
    schoolDetailsLoading: false,

    // Online Admission
    applicationSubmitting: false,
    applicationSuccess: false,

    // Common
    error: null,
    successMsg: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMsg = null;
      state.applicationSuccess = false;
    },
    resetSchoolDetails: (state) => {
      state.schoolDetails = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Top Schools
    builder
      .addCase(fetchTopSchools.pending, (state) => {
        state.topSchoolsLoading = true;
        state.error = null;
      })
      .addCase(fetchTopSchools.fulfilled, (state, action) => {
        state.topSchoolsLoading = false;
        state.topSchools = action.payload.data || [];
      })
      .addCase(fetchTopSchools.rejected, (state, action) => {
        state.topSchoolsLoading = false;
        state.error = action.payload;
      });

    // Fetch All Schools
    builder
      .addCase(fetchAllSchools.pending, (state) => {
        state.allSchoolsLoading = true;
        state.error = null;
      })
      .addCase(fetchAllSchools.fulfilled, (state, action) => {
        state.allSchoolsLoading = false;
        state.allSchools = action.payload.data || [];
        state.allSchoolsPagination = action.payload.pagination || {
          total: 0,
          page: 1,
          limit: 12,
          pages: 0,
        };
      })
      .addCase(fetchAllSchools.rejected, (state, action) => {
        state.allSchoolsLoading = false;
        state.error = action.payload;
      });

    // Fetch School Details
    builder
      .addCase(fetchSchoolDetails.pending, (state) => {
        state.schoolDetailsLoading = true;
        state.error = null;
      })
      .addCase(fetchSchoolDetails.fulfilled, (state, action) => {
        state.schoolDetailsLoading = false;
        state.schoolDetails = action.payload.data || null;
      })
      .addCase(fetchSchoolDetails.rejected, (state, action) => {
        state.schoolDetailsLoading = false;
        state.error = action.payload;
      });

    // Submit Online Admission
    builder
      .addCase(submitOnlineAdmission.pending, (state) => {
        state.applicationSubmitting = true;
        state.error = null;
        state.applicationSuccess = false;
      })
      .addCase(submitOnlineAdmission.fulfilled, (state, action) => {
        state.applicationSubmitting = false;
        state.successMsg = action.payload.message;
        state.applicationSuccess = true;
      })
      .addCase(submitOnlineAdmission.rejected, (state, action) => {
        state.applicationSubmitting = false;
        state.error = action.payload;
        state.applicationSuccess = false;
      });
  },
});

export const { clearMessages, resetSchoolDetails } = publicSchoolSlice.actions;
export default publicSchoolSlice.reducer;
