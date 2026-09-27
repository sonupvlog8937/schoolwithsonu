import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchDataFromApi, postData, editData, deleteData } from '@/utils/api';

// Fetch all records for a module
export const fetchMasterConfig = createAsyncThunk<
  { module: string; records: any[] },
  string
>('masterConfiguration/fetch', async (module) => {
  const response = await fetchDataFromApi(`/master-config/${module}`);
  return { module, records: response?.data || [] };
});

// Create new record
export const createMasterConfig = createAsyncThunk<
  { module: string; record: any },
  { module: string; data: any }
>('masterConfiguration/create', async ({ module, data }) => {
  const response = await postData(`/master-config/${module}`, data);
  return { module, record: response?.data };
});

// Update existing record
export const updateMasterConfig = createAsyncThunk<
  { module: string; id: string; record: any },
  { module: string; id: string; data: any }
>('masterConfiguration/update', async ({ module, id, data }) => {
  const response = await editData(`/master-config/${module}/${id}`, data);
  return { module, id, record: response?.data };
});

// Delete record
export const deleteMasterConfig = createAsyncThunk<
  { module: string; id: string },
  { module: string; id: string }
>('masterConfiguration/delete', async ({ module, id }) => {
  await deleteData(`/master-config/${module}/${id}`);
  return { module, id };
});

interface ModuleState {
  records: any[];
  loading: boolean;
  error?: string | null;
}

interface MasterConfigState {
  sessions: any[];
  loading: boolean;
  error: string | null;
  modules: Record<string, ModuleState>;
}

const slice = createSlice({
  name: 'masterConfiguration',
  initialState: {
    sessions: [],
    loading: false,
    error: null,
    modules: {},
  } as MasterConfigState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchMasterConfig.pending, (state, action) => {
      const module = action.meta.arg;
      if (module === 'session') {
        state.loading = true;
        state.error = null;
      } else {
        state.modules[module] = { records: [], loading: true, error: null };
      }
    });
    builder.addCase(fetchMasterConfig.fulfilled, (state, action) => {
      const { module, records } = action.payload;
      if (module === 'session') {
        state.sessions = records;
        state.loading = false;
      } else {
        state.modules[module] = { records, loading: false, error: null };
      }
    });
    builder.addCase(fetchMasterConfig.rejected, (state, action) => {
      const module = action.meta.arg;
      if (module === 'session') {
        state.loading = false;
        state.error = action.error.message || 'Failed to load sessions';
      } else {
        state.modules[module] = {
          records: [],
          loading: false,
          error: action.error.message || 'Failed to load',
        };
      }
    });

    // Create
    builder.addCase(createMasterConfig.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createMasterConfig.fulfilled, (state, action) => {
      const { module, record } = action.payload;
      if (module === 'session') {
        state.sessions = [record, ...state.sessions];
        state.loading = false;
      } else {
        const current = state.modules[module] || { records: [], loading: false };
        current.records = [record, ...current.records];
        state.modules[module] = current;
      }
    });
    builder.addCase(createMasterConfig.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create';
    });

    // Update
    builder.addCase(updateMasterConfig.fulfilled, (state, action) => {
      const { module, id, record } = action.payload;
      if (module === 'session') {
        const index = state.sessions.findIndex((s: any) => s._id === id);
        if (index !== -1) state.sessions[index] = record;
      } else {
        const current = state.modules[module];
        if (current) {
          const index = current.records.findIndex((r: any) => r._id === id);
          if (index !== -1) current.records[index] = record;
        }
      }
    });

    // Delete
    builder.addCase(deleteMasterConfig.fulfilled, (state, action) => {
      const { module, id } = action.payload;
      if (module === 'session') {
        state.sessions = state.sessions.filter((s: any) => s._id !== id);
      } else {
        const current = state.modules[module];
        if (current) {
          current.records = current.records.filter((r: any) => r._id !== id);
        }
      }
    });
  },
});

export default slice.reducer;
