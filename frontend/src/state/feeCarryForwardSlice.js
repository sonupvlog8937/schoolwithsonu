import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseUrl } from '../environment';

const initialState = {
  pendingStudents: [],
  pendingStudentsPagination: {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10
  },
  carryForwardRecords: [],
  recordsPagination: {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10
  },
  summary: {
    pending: { count: 0, totalAmount: 0 },
    processed: { count: 0, totalAmount: 0 },
    cancelled: { count: 0, totalAmount: 0 }
  },
  loading: false,
  error: null,
  filters: {
    search: '',
    classId: '',
    section: '',
    status: '',
    fromSession: '',
    toSession: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
};

// Get pending students
export const getPendingStudents = createAsyncThunk(
  'feeCarryForward/getPendingStudents',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/fee-carry-forward/pending-students`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending students');
    }
  }
);

// Create carry forward
export const createCarryForward = createAsyncThunk(
  'feeCarryForward/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseUrl}/fee-carry-forward/create`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create carry forward');
    }
  }
);

// Get carry forward records
export const getCarryForwardRecords = createAsyncThunk(
  'feeCarryForward/getRecords',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/fee-carry-forward`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch records');
    }
  }
);

// Update carry forward
export const updateCarryForward = createAsyncThunk(
  'feeCarryForward/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${baseUrl}/fee-carry-forward/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update record');
    }
  }
);

// Delete carry forward
export const deleteCarryForward = createAsyncThunk(
  'feeCarryForward/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${baseUrl}/fee-carry-forward/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete record');
    }
  }
);

// Process carry forward
export const processCarryForward = createAsyncThunk(
  'feeCarryForward/process',
  async (recordIds, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseUrl}/fee-carry-forward/process`, { recordIds });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process records');
    }
  }
);

// Get summary
export const getCarryForwardSummary = createAsyncThunk(
  'feeCarryForward/getSummary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/fee-carry-forward/summary`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch summary');
    }
  }
);

// Update student balance (save to backend)
export const saveStudentBalance = createAsyncThunk(
  'feeCarryForward/saveBalance',
  async ({ studentId, balance }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${baseUrl}/fee-carry-forward/update-balance/${studentId}`, { balance });
      return { studentId, balance, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save balance');
    }
  }
);

const feeCarryForwardSlice = createSlice({
  name: 'feeCarryForward',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateStudentBalance: (state, action) => {
      const { studentId, newBalance } = action.payload;
      const studentIndex = state.pendingStudents.findIndex(s => s._id === studentId);
      if (studentIndex !== -1) {
        state.pendingStudents[studentIndex].pendingBalance = newBalance;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Get pending students
      .addCase(getPendingStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingStudents = action.payload.data;
        state.pendingStudentsPagination = action.payload.pagination;
      })
      .addCase(getPendingStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create carry forward
      .addCase(createCarryForward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCarryForward.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createCarryForward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get records
      .addCase(getCarryForwardRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCarryForwardRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.carryForwardRecords = action.payload.data;
        state.recordsPagination = action.payload.pagination;
      })
      .addCase(getCarryForwardRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateCarryForward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCarryForward.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.carryForwardRecords.findIndex(r => r._id === action.payload.data._id);
        if (index !== -1) {
          state.carryForwardRecords[index] = action.payload.data;
        }
      })
      .addCase(updateCarryForward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteCarryForward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCarryForward.fulfilled, (state, action) => {
        state.loading = false;
        state.carryForwardRecords = state.carryForwardRecords.filter(r => r._id !== action.payload.id);
        state.recordsPagination.totalRecords -= 1;
      })
      .addCase(deleteCarryForward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Process
      .addCase(processCarryForward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processCarryForward.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(processCarryForward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get summary
      .addCase(getCarryForwardSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCarryForwardSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.data;
      })
      .addCase(getCarryForwardSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Save student balance
      .addCase(saveStudentBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveStudentBalance.fulfilled, (state, action) => {
        state.loading = false;
        const { studentId, balance } = action.payload;
        const studentIndex = state.pendingStudents.findIndex(s => s._id === studentId);
        if (studentIndex !== -1) {
          state.pendingStudents[studentIndex].pendingBalance = balance;
        }
      })
      .addCase(saveStudentBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilters, resetFilters, clearError, updateStudentBalance } = feeCarryForwardSlice.actions;
export default feeCarryForwardSlice.reducer;
