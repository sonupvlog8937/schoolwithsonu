import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchDataFromApi, getAuthHeaders } from '@/utils/api';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001';

const apiByModule: Record<string, string> = {
  sections: '/class/fetch-all',
  classes: '/class/fetch-all',
  subjects: '/subject/fetch-all',
  'class-teacher': '/class-teacher/fetch-all',
  timing: '/period/all',
  'student-timetable': '/period/all',
  'teacher-timetable': '/period/all',
  'change-arrangement': '/change-arrangement/fetch-all',
  'absent-status': '/attendance/school/overview',
};

const createApiByModule: Record<string, string> = {
  classes: '/class/create',
  subjects: '/subject/create',
  timing: '/period/create',
  'class-teacher': '/class-teacher/create',
  'change-arrangement': '/change-arrangement/create',
};

const updateApiByModule: Record<string, string> = {
  classes: '/class/update',
  subjects: '/subject/update',
  timing: '/period/update',
  'class-teacher': '/class-teacher/update',
  'change-arrangement': '/change-arrangement/update',
};

const deleteApiByModule: Record<string, string> = {
  classes: '/class/delete',
  subjects: '/subject/delete',
  timing: '/period/delete',
  'class-teacher': '/class-teacher/delete',
  'change-arrangement': '/change-arrangement/delete',
};

export const fetchAcademicModule = createAsyncThunk<{ module: string; records: any[] }, string>(
  'academicModule/fetch',
  async (module) => {
    const response = await fetchDataFromApi(apiByModule[module]);
    return { module, records: response?.data || response?.periods || response?.students || [] };
  }
);

export const createAcademicRecord = createAsyncThunk(
  'academicModule/create',
  async ({ module, payload }: { module: string; payload: any }) => {
    const headers = await getAuthHeaders();
    const endpoint = createApiByModule[module];
    if (!endpoint) throw new Error(`No create endpoint for module: ${module}`);
    
    const response = await axios.post(`${API_URL}${endpoint}`, payload, { headers });
    return { module, record: response.data.data };
  }
);

export const updateAcademicRecord = createAsyncThunk(
  'academicModule/update',
  async ({ module, id, payload }: { module: string; id: string; payload: any }) => {
    const headers = await getAuthHeaders();
    const endpoint = updateApiByModule[module];
    if (!endpoint) throw new Error(`No update endpoint for module: ${module}`);
    
    const response = await axios.patch(`${API_URL}${endpoint}/${id}`, payload, { headers });
    return { module, id, record: response.data.data };
  }
);

export const deleteAcademicRecord = createAsyncThunk(
  'academicModule/delete',
  async ({ module, id }: { module: string; id: string }) => {
    const headers = await getAuthHeaders();
    const endpoint = deleteApiByModule[module];
    if (!endpoint) throw new Error(`No delete endpoint for module: ${module}`);
    
    await axios.delete(`${API_URL}${endpoint}/${id}`, { headers });
    return { module, id };
  }
);

export const fetchClassesForDropdown = createAsyncThunk(
  'academicModule/fetchClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchDataFromApi('/class-teacher/classes');
      return response?.data || [];
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Unable to load classes');
    }
  }
);

export const fetchTeachersForDropdown = createAsyncThunk(
  'academicModule/fetchTeachers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchDataFromApi('/class-teacher/teachers');
      return response?.data || [];
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Unable to load teachers');
    }
  }
);

export const fetchSectionsForDropdown = createAsyncThunk(
  'academicModule/fetchSections',
  async (_classId: string | undefined, { rejectWithValue }) => {
    try {
      // Sections are not class-specific, so we fetch all sections for the school
      const response = await fetchDataFromApi('/class-teacher/sections');
      return response?.data || [];
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Unable to load sections');
    }
  }
);

const slice = createSlice({
  name: 'academicModule',
  initialState: {
    modules: {} as Record<string, any[]>,
    loading: false,
    error: null as string | null,
    dropdownData: {
      classes: [] as any[],
      teachers: [] as any[],
      sections: [] as any[],
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchAcademicModule.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAcademicModule.fulfilled, (state, action) => {
      state.loading = false;
      state.modules[action.payload.module] = action.payload.records;
    });
    builder.addCase(fetchAcademicModule.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Unable to load academic records';
    });

    // Create
    builder.addCase(createAcademicRecord.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createAcademicRecord.fulfilled, (state, action) => {
      state.loading = false;
      const { module, record } = action.payload;
      if (!state.modules[module]) state.modules[module] = [];
      state.modules[module].push(record);
    });
    builder.addCase(createAcademicRecord.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Unable to create record';
    });

    // Update
    builder.addCase(updateAcademicRecord.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateAcademicRecord.fulfilled, (state, action) => {
      state.loading = false;
      const { module, id, record } = action.payload;
      if (state.modules[module]) {
        const index = state.modules[module].findIndex((r: any) => r._id === id);
        if (index !== -1) {
          state.modules[module][index] = record;
        }
      }
    });
    builder.addCase(updateAcademicRecord.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Unable to update record';
    });

    // Delete
    builder.addCase(deleteAcademicRecord.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteAcademicRecord.fulfilled, (state, action) => {
      state.loading = false;
      const { module, id } = action.payload;
      if (state.modules[module]) {
        state.modules[module] = state.modules[module].filter((r: any) => r._id !== id);
      }
    });
    builder.addCase(deleteAcademicRecord.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Unable to delete record';
    });

    // Dropdown data
    builder.addCase(fetchClassesForDropdown.fulfilled, (state, action) => {
      state.dropdownData.classes = action.payload;
    });
    builder.addCase(fetchTeachersForDropdown.fulfilled, (state, action) => {
      state.dropdownData.teachers = action.payload;
    });
    builder.addCase(fetchSectionsForDropdown.fulfilled, (state, action) => {
      state.dropdownData.sections = action.payload;
    });
  },
});

export default slice.reducer;
