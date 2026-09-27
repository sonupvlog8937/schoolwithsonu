import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../environment";

const config = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}`,
    },
  };
};

export const fetchCurriculumPlanning = createAsyncThunk("curriculumPlanning/fetch", async (resource, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/curriculum-planning/${resource}`, config());
    return { resource, records: response.data.data || [], summary: response.data.summary || {} };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to load curriculum planning records");
  }
});

export const createCurriculumPlanning = createAsyncThunk("curriculumPlanning/create", async ({ resource, data }, { rejectWithValue }) => {
  try {
    return (await axios.post(`${baseUrl}/curriculum-planning/${resource}`, data, config())).data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to save curriculum record");
  }
});

export const deleteCurriculumPlanning = createAsyncThunk("curriculumPlanning/delete", async ({ resource, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`${baseUrl}/curriculum-planning/${resource}/${id}`, config());
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to remove curriculum record");
  }
});

const slice = createSlice({
  name: "curriculumPlanning",
  initialState: {
    resource: "",
    records: [],
    summary: {},
    loading: false,
    saving: false,
    error: null,
    success: null,
  },
  reducers: {
    clearCurriculumPlanningNotice: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurriculumPlanning.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurriculumPlanning.fulfilled, (state, action) => {
        state.loading = false;
        state.resource = action.payload.resource;
        state.records = action.payload.records;
        state.summary = action.payload.summary;
      })
      .addCase(fetchCurriculumPlanning.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCurriculumPlanning.pending, (state) => {
        state.saving = true;
      })
      .addCase(createCurriculumPlanning.fulfilled, (state, action) => {
        state.saving = false;
        state.records.unshift(action.payload);
        state.success = "Saved successfully";
      })
      .addCase(createCurriculumPlanning.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(deleteCurriculumPlanning.fulfilled, (state, action) => {
        state.records = state.records.filter((record) => record._id !== action.payload);
        state.success = "Removed successfully";
      })
      .addCase(deleteCurriculumPlanning.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearCurriculumPlanningNotice } = slice.actions;
export default slice.reducer;
