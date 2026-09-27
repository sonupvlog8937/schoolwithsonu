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

export const fetchExam = createAsyncThunk("exam/fetch", async (resource, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/exam/${resource}`, config());
    return { resource, records: response.data.data || [] };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to load exam records");
  }
});

export const createExam = createAsyncThunk("exam/create", async ({ resource, data }, { rejectWithValue }) => {
  try {
    return (await axios.post(`${baseUrl}/exam/${resource}`, data, config())).data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to save exam record");
  }
});

export const deleteExam = createAsyncThunk("exam/delete", async ({ resource, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`${baseUrl}/exam/${resource}/${id}`, config());
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to remove exam record");
  }
});

const slice = createSlice({
  name: "exam",
  initialState: {
    resource: "",
    records: [],
    loading: false,
    saving: false,
    error: null,
    success: null,
  },
  reducers: {
    clearExamNotice: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExam.fulfilled, (state, action) => {
        state.loading = false;
        state.resource = action.payload.resource;
        state.records = action.payload.records;
      })
      .addCase(fetchExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createExam.pending, (state) => {
        state.saving = true;
      })
      .addCase(createExam.fulfilled, (state, action) => {
        state.saving = false;
        state.records.unshift(action.payload);
        state.success = "Saved successfully";
      })
      .addCase(createExam.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.records = state.records.filter((record) => record._id !== action.payload);
        state.success = "Removed successfully";
      })
      .addCase(deleteExam.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearExamNotice } = slice.actions;
export default slice.reducer;
