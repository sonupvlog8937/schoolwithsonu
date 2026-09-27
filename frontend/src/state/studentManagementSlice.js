import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// Bulk Delete
export const bulkDeleteStudents = createAsyncThunk(
  'studentManagement/bulkDelete',
  async (studentIds, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/students/bulk-delete', { studentIds });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const checkBulkDeleteStatus = createAsyncThunk(
  'studentManagement/checkBulkDeleteStatus',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/school/settings/bulk-delete-status');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Multi Class
export const updateAdditionalClasses = createAsyncThunk(
  'studentManagement/updateAdditionalClasses',
  async ({ studentId, additionalClasses }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/students/${studentId}/additional-classes`, {
        additionalClasses,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const checkMultiClassStatus = createAsyncThunk(
  'studentManagement/checkMultiClassStatus',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/school/settings/multi-class-status');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch Online Admissions
export const fetchOnlineAdmissions = createAsyncThunk(
  'studentManagement/fetchOnlineAdmissions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { status = 'Pending', page = 1, limit = 10, search = '' } = params;
      const res = await axios.get('/api/school/online-admissions', {
        params: { status, page, limit, search },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const approveOnlineAdmission = createAsyncThunk(
  'studentManagement/approveOnlineAdmission',
  async (applicationId, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/school/online-admissions/${applicationId}/approve`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const rejectOnlineAdmission = createAsyncThunk(
  'studentManagement/rejectOnlineAdmission',
  async ({ applicationId, rejectionReason }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/school/online-admissions/${applicationId}/reject`, {
        rejectionReason,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch Disabled Students
export const fetchDisabledStudents = createAsyncThunk(
  'studentManagement/fetchDisabledStudents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, search = '', class: classId = '' } = params;
      const res = await axios.get('/api/students/disabled', {
        params: { page, limit, search, class: classId },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Enable Student
export const enableStudent = createAsyncThunk(
  'studentManagement/enableStudent',
  async (studentId, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/students/${studentId}/enable`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Disable Student
export const disableStudent = createAsyncThunk(
  'studentManagement/disableStudent',
  async ({ studentId, reason }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/students/${studentId}/disable`, { reason });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const studentManagementSlice = createSlice({
  name: 'studentManagement',
  initialState: {
    // Bulk Delete
    bulkDeleteDisabled: false,
    bulkDeleteLoading: false,
    
    // Multi Class
    multiClassDisabled: false,
    multiClassLoading: false,
    
    // Online Admissions
    onlineAdmissions: [],
    onlineAdmissionsLoading: false,
    onlineAdmissionsPagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 0,
    },

    // Disabled Students
    disabledStudents: [],
    disabledStudentsLoading: false,
    disabledStudentsPagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 0,
    },
    
    // Common
    loading: false,
    error: null,
    successMsg: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMsg = null;
    },
  },
  extraReducers: (builder) => {
    // Bulk Delete Status
    builder
      .addCase(checkBulkDeleteStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkBulkDeleteStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.bulkDeleteDisabled = action.payload.disabled || false;
      })
      .addCase(checkBulkDeleteStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Bulk Delete
    builder
      .addCase(bulkDeleteStudents.pending, (state) => {
        state.bulkDeleteLoading = true;
        state.error = null;
      })
      .addCase(bulkDeleteStudents.fulfilled, (state, action) => {
        state.bulkDeleteLoading = false;
        state.successMsg = action.payload.message;
      })
      .addCase(bulkDeleteStudents.rejected, (state, action) => {
        state.bulkDeleteLoading = false;
        state.error = action.payload;
      });

    // Multi Class Status
    builder
      .addCase(checkMultiClassStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkMultiClassStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.multiClassDisabled = action.payload.disabled || false;
      })
      .addCase(checkMultiClassStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Additional Classes
    builder
      .addCase(updateAdditionalClasses.pending, (state) => {
        state.multiClassLoading = true;
        state.error = null;
      })
      .addCase(updateAdditionalClasses.fulfilled, (state, action) => {
        state.multiClassLoading = false;
        state.successMsg = action.payload.message;
      })
      .addCase(updateAdditionalClasses.rejected, (state, action) => {
        state.multiClassLoading = false;
        state.error = action.payload;
      });

    // Fetch Online Admissions
    builder
      .addCase(fetchOnlineAdmissions.pending, (state) => {
        state.onlineAdmissionsLoading = true;
        state.error = null;
      })
      .addCase(fetchOnlineAdmissions.fulfilled, (state, action) => {
        state.onlineAdmissionsLoading = false;
        state.onlineAdmissions = action.payload.applications || [];
        state.onlineAdmissionsPagination = action.payload.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0,
        };
      })
      .addCase(fetchOnlineAdmissions.rejected, (state, action) => {
        state.onlineAdmissionsLoading = false;
        state.error = action.payload;
      });

    // Approve Online Admission
    builder
      .addCase(approveOnlineAdmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveOnlineAdmission.fulfilled, (state, action) => {
        state.loading = false;
        state.successMsg = action.payload.message;
      })
      .addCase(approveOnlineAdmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Reject Online Admission
    builder
      .addCase(rejectOnlineAdmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectOnlineAdmission.fulfilled, (state, action) => {
        state.loading = false;
        state.successMsg = action.payload.message;
      })
      .addCase(rejectOnlineAdmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Disabled Students
    builder
      .addCase(fetchDisabledStudents.pending, (state) => {
        state.disabledStudentsLoading = true;
        state.error = null;
      })
      .addCase(fetchDisabledStudents.fulfilled, (state, action) => {
        state.disabledStudentsLoading = false;
        state.disabledStudents = action.payload.data || [];
        state.disabledStudentsPagination = action.payload.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0,
        };
      })
      .addCase(fetchDisabledStudents.rejected, (state, action) => {
        state.disabledStudentsLoading = false;
        state.error = action.payload;
      });

    // Enable Student
    builder
      .addCase(enableStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enableStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.successMsg = action.payload.message;
      })
      .addCase(enableStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Disable Student
    builder
      .addCase(disableStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disableStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.successMsg = action.payload.message;
      })
      .addCase(disableStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = studentManagementSlice.actions;
export default studentManagementSlice.reducer;
