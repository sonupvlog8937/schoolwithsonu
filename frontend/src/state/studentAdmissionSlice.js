import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/** Fetch students with pagination, search, and filters */
export const fetchStudents = createAsyncThunk(
  "studentAdmission/fetchStudents",
  async (params = {}, { rejectWithValue }) => {
    try {
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
      );
      const res = await axios.get("/api/students/all", { params: clean });
      return res.data; // { success, data, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Fetch single student by ID */
export const fetchStudentById = createAsyncThunk(
  "studentAdmission/fetchStudentById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/students/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Fetch dropdown options (classes, sections, etc.) */
export const fetchDropdownOptions = createAsyncThunk(
  "studentAdmission/fetchDropdownOptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/students/dropdown-options");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Fetch dropdown options (PUBLIC - no auth required) */
export const fetchDropdownOptionsPublic = createAsyncThunk(
  "studentAdmission/fetchDropdownOptionsPublic",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/students/dropdown-options-public");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Add new student */
export const addStudent = createAsyncThunk(
  "studentAdmission/addStudent",
  async (studentData, { rejectWithValue }) => {
    try {
      console.log('Sending student data to API:', studentData);
      const res = await axios.post("/api/students/add", studentData);
      return res.data;
    } catch (err) {
      console.error('Add student error:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Update student */
export const updateStudent = createAsyncThunk(
  "studentAdmission/updateStudent",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/students/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Delete student */
export const deleteStudent = createAsyncThunk(
  "studentAdmission/deleteStudent",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/students/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Fetch student statistics */
export const fetchStudentStats = createAsyncThunk(
  "studentAdmission/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/students/stats");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Change student or parent password */
export const changeStudentPassword = createAsyncThunk(
  "studentAdmission/changePassword",
  async ({ id, userType, newPassword }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/students/${id}/change-password`, { userType, newPassword });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Generate login credentials for existing student */
export const generateStudentLogin = createAsyncThunk(
  "studentAdmission/generateLogin",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/students/${id}/generate-login`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  students: [],
  currentStudent: null,
  stats: null,
  pagination: { total: 0, page: 1, limit: 10, pages: 0 },
  loginCredentials: null, // Store login credentials after student creation
  
  // Dropdown options
  dropdownOptions: {
    classes: [],
    sections: [],
    categories: [],
    religions: [],
    castes: [],
    bloodGroups: [],
    houses: [],
    routes: [],
    pickupPoints: [],
    hostels: [],
    rooms: [],
    states: [
      'Andhra Pradesh',
      'Arunachal Pradesh',
      'Assam',
      'Bihar',
      'Chhattisgarh',
      'Goa',
      'Gujarat',
      'Haryana',
      'Himachal Pradesh',
      'Jharkhand',
      'Karnataka',
      'Kerala',
      'Madhya Pradesh',
      'Maharashtra',
      'Manipur',
      'Meghalaya',
      'Mizoram',
      'Nagaland',
      'Odisha',
      'Punjab',
      'Rajasthan',
      'Sikkim',
      'Tamil Nadu',
      'Telangana',
      'Tripura',
      'Uttar Pradesh',
      'Uttarakhand',
      'West Bengal',
      'Andaman and Nicobar Islands',
      'Chandigarh',
      'Dadra and Nagar Haveli and Daman and Diu',
      'Delhi',
      'Jammu and Kashmir',
      'Ladakh',
      'Lakshadweep',
      'Puducherry',
    ],
    feesStructure: [],
  },

  // Filters
  filters: {
    search: "",
    class: "",
    section: "",
    category: "",
    gender: "",
    admissionYear: "",
    page: 1,
    limit: 10,
  },

  loading: false,
  submitLoading: false,
  error: null,
  successMsg: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const studentAdmissionSlice = createSlice({
  name: "studentAdmission",
  initialState,
  reducers: {
    setFilters(state, action) {
      const isPageChange = Object.keys(action.payload).every((k) =>
        k === "page" || k === "limit"
      );
      state.filters = {
        ...state.filters,
        ...action.payload,
        ...(isPageChange ? {} : { page: 1 }),
      };
    },
    clearMessages(state) {
      state.error = null;
      state.successMsg = null;
    },
    clearCurrentStudent(state) {
      state.currentStudent = null;
    },
    clearLoginCredentials(state) {
      state.loginCredentials = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchStudents ──────────────────────────────────────────────────────
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch students";
      });

    // ── fetchStudentById ───────────────────────────────────────────────────
    builder
      .addCase(fetchStudentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStudent = action.payload;
      })
      .addCase(fetchStudentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch student";
      });

    // ── fetchDropdownOptions ───────────────────────────────────────────────
    builder.addCase(fetchDropdownOptions.fulfilled, (state, action) => {
      state.dropdownOptions = { ...state.dropdownOptions, ...action.payload };
    });
    
    // ── fetchDropdownOptionsPublic (same as above, for public use) ─────────
    builder.addCase(fetchDropdownOptionsPublic.fulfilled, (state, action) => {
      state.dropdownOptions = { ...state.dropdownOptions, ...action.payload };
    });

    // ── addStudent ─────────────────────────────────────────────────────────
    builder
      .addCase(addStudent.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Student added successfully";
        if (action.payload.data) state.students.unshift(action.payload.data);
        if (action.payload.loginCredentials) {
          state.loginCredentials = {
            ...action.payload.loginCredentials,
            studentName: action.payload.data ? `${action.payload.data.firstName} ${action.payload.data.lastName}` : ''
          };
        }
      })
      .addCase(addStudent.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to add student";
      });

    // ── updateStudent ──────────────────────────────────────────────────────
    builder
      .addCase(updateStudent.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Student updated successfully";
        const updated = action.payload.data;
        if (updated) {
          const idx = state.students.findIndex((s) => s._id === updated._id);
          if (idx !== -1) state.students[idx] = updated;
        }
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to update student";
      });

    // ── deleteStudent ──────────────────────────────────────────────────────
    builder
      .addCase(deleteStudent.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = "Student deleted successfully";
        state.students = state.students.filter((s) => s._id !== action.payload);
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to delete student";
      });

    // ── fetchStudentStats ──────────────────────────────────────────────────
    builder.addCase(fetchStudentStats.fulfilled, (state, action) => {
      state.stats = action.payload;
    });

    // ── changeStudentPassword ──────────────────────────────────────────────
    builder
      .addCase(changeStudentPassword.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(changeStudentPassword.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Password changed successfully";
      })
      .addCase(changeStudentPassword.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to change password";
      });
  },
});

export const { setFilters, clearMessages, clearCurrentStudent, clearLoginCredentials } = studentAdmissionSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectStudentFilters = (state) => state.studentAdmission.filters;
export const selectDropdownOptions = (state) => state.studentAdmission.dropdownOptions;

const studentAdmissionReducer = studentAdmissionSlice.reducer;
export default studentAdmissionReducer;
