import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

// Get Fee Assignment Dashboard Data
export const getFeeAssignmentDashboard = createAsyncThunk(
  'feeAssignment/getDashboard',
  async ({ schoolId, session }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { session }
      };
      
      const response = await axios.get(
        `${API_URL}/api/fee-assignment/dashboard/${schoolId}`,
        config
      );
      
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch dashboard data'
      );
    }
  }
);

// Get Students with Fee Status
export const getStudentsWithFeeStatus = createAsyncThunk(
  'feeAssignment/getStudents',
  async ({ schoolId, filters }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: filters
      };
      
      const response = await axios.get(
        `${API_URL}/api/fee-assignment/students/${schoolId}`,
        config
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch students'
      );
    }
  }
);

// Get Fee Groups
export const getFeeGroups = createAsyncThunk(
  'feeAssignment/getFeeGroups',
  async (schoolId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      };
      
      const response = await axios.get(
        `${API_URL}/api/fee-assignment/fee-groups/${schoolId}`,
        config
      );
      
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch fee groups'
      );
    }
  }
);

// Assign Fee to Students
export const assignFeeToStudents = createAsyncThunk(
  'feeAssignment/assignFee',
  async ({ schoolId, assignmentData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      };
      
      const response = await axios.post(
        `${API_URL}/api/fee-assignment/assign/${schoolId}`,
        assignmentData,
        config
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to assign fee'
      );
    }
  }
);

// Update Fee Assignment
export const updateFeeAssignment = createAsyncThunk(
  'feeAssignment/update',
  async ({ assignmentId, updates }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      };
      
      const response = await axios.put(
        `${API_URL}/api/fee-assignment/${assignmentId}`,
        updates,
        config
      );
      
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update fee assignment'
      );
    }
  }
);

// Delete Fee Assignment
export const deleteFeeAssignment = createAsyncThunk(
  'feeAssignment/delete',
  async (assignmentId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      };
      
      const response = await axios.delete(
        `${API_URL}/api/fee-assignment/${assignmentId}`,
        config
      );
      
      return { assignmentId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete fee assignment'
      );
    }
  }
);

const feeAssignmentSlice = createSlice({
  name: 'feeAssignment',
  initialState: {
    dashboard: {
      totalStudents: 0,
      feeAssigned: 0,
      feeNotAssigned: 0,
      gradesCovered: 0,
      totalGrades: 0,
      gradeWiseBreakdown: [],
      session: new Date().getFullYear().toString(),
      filters: {
        classes: [],
        sections: [],
        feeStatuses: [],
        studentStatuses: []
      }
    },
    students: [],
    feeGroups: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalRecords: 0,
      recordsPerPage: 20
    },
    loading: false,
    studentsLoading: false,
    feeGroupsLoading: false,
    assignmentLoading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Dashboard
      .addCase(getFeeAssignmentDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeeAssignmentDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(getFeeAssignmentDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Students
      .addCase(getStudentsWithFeeStatus.pending, (state) => {
        state.studentsLoading = true;
        state.error = null;
      })
      .addCase(getStudentsWithFeeStatus.fulfilled, (state, action) => {
        state.studentsLoading = false;
        state.students = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getStudentsWithFeeStatus.rejected, (state, action) => {
        state.studentsLoading = false;
        state.error = action.payload;
      })
      
      // Get Fee Groups
      .addCase(getFeeGroups.pending, (state) => {
        state.feeGroupsLoading = true;
        state.error = null;
      })
      .addCase(getFeeGroups.fulfilled, (state, action) => {
        state.feeGroupsLoading = false;
        state.feeGroups = action.payload;
      })
      .addCase(getFeeGroups.rejected, (state, action) => {
        state.feeGroupsLoading = false;
        state.error = action.payload;
      })
      
      // Assign Fee
      .addCase(assignFeeToStudents.pending, (state) => {
        state.assignmentLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(assignFeeToStudents.fulfilled, (state, action) => {
        state.assignmentLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(assignFeeToStudents.rejected, (state, action) => {
        state.assignmentLoading = false;
        state.error = action.payload;
      })
      
      // Update Fee Assignment
      .addCase(updateFeeAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFeeAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Fee assignment updated successfully';
        
        // Update in students array if exists
        const index = state.students.findIndex(
          s => s._id === action.payload.student._id
        );
        if (index !== -1) {
          state.students[index] = {
            ...state.students[index],
            ...action.payload
          };
        }
      })
      .addCase(updateFeeAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Fee Assignment
      .addCase(deleteFeeAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFeeAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(deleteFeeAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess, setFilters } = feeAssignmentSlice.actions;
export default feeAssignmentSlice.reducer;
