import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../environment";

const apiByModule = {
  sections: "/class/fetch-all", classes: "/class/fetch-all", subjects: "/subject/fetch-all", "class-teacher": "/class-teacher/fetch-all", timing: "/period/all", "student-timetable": "/period/all", "teacher-timetable": "/period/all", "change-arrangement": "/change-arrangement/fetch-all", "absent-status": "/attendance/school/overview",
};
export const fetchAcademicModule = createAsyncThunk("academicModule/fetch", async (module, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${baseUrl}${apiByModule[module]}`, { headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` } });
    const payload = response.data;
    console.log(`Fetched ${module} data:`, payload);
    return { module, records: payload.data || payload.periods || payload.students || [] };
  } catch (error) { 
    console.error(`Error fetching ${module}:`, error);
    return rejectWithValue({ module, message: error.response?.data?.message || "Unable to load academic records" }); 
  }
});
const mutationConfig = { classes: { create: "/class/create", update: (id) => `/class/update/${id}`, remove: (id) => `/class/delete/${id}` }, subjects: { create: "/subject/create", update: (id) => `/subject/update/${id}`, remove: (id) => `/subject/delete/${id}` }, "class-teacher": { create: "/class-teacher/create", update: (id) => `/class-teacher/update/${id}`, remove: (id) => `/class-teacher/delete/${id}` }, timing: { create: "/period/create", update: (id) => `/period/update/${id}`, remove: (id) => `/period/delete/${id}` }, "change-arrangement": { create: "/change-arrangement/create", update: (id) => `/change-arrangement/update/${id}`, remove: (id) => `/change-arrangement/delete/${id}` } };
const requestConfig = () => { const token = localStorage.getItem("token"); return { headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` } }; };
export const createAcademicRecord = createAsyncThunk("academicModule/create", async ({ module, payload }, { rejectWithValue }) => { try { const response = await axios.post(`${baseUrl}${mutationConfig[module].create}`, payload, requestConfig()); return { module, record: response.data.data }; } catch (error) { return rejectWithValue(error.response?.data?.message || "Unable to create record"); } });
export const updateAcademicRecord = createAsyncThunk("academicModule/update", async ({ module, id, payload }, { rejectWithValue }) => { try { const response = await axios.patch(`${baseUrl}${mutationConfig[module].update(id)}`, payload, requestConfig()); return { module, record: response.data.data }; } catch (error) { return rejectWithValue(error.response?.data?.message || "Unable to update record"); } });
export const deleteAcademicRecord = createAsyncThunk("academicModule/delete", async ({ module, id }, { rejectWithValue }) => { try { await axios.delete(`${baseUrl}${mutationConfig[module].remove(id)}`, requestConfig()); return { module, id }; } catch (error) { return rejectWithValue(error.response?.data?.message || "Unable to remove record"); } });
export const fetchClassesForDropdown = createAsyncThunk("academicModule/fetchClasses", async (_, { rejectWithValue }) => { try { const token = localStorage.getItem("token"); const response = await axios.get(`${baseUrl}/class-teacher/classes`, { headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` } }); return response.data.data || []; } catch (error) { return rejectWithValue(error.response?.data?.message || "Unable to load classes"); } });
export const fetchTeachersForDropdown = createAsyncThunk("academicModule/fetchTeachers", async (_, { rejectWithValue }) => { try { const token = localStorage.getItem("token"); const response = await axios.get(`${baseUrl}/class-teacher/teachers`, { headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` } }); return response.data.data || []; } catch (error) { return rejectWithValue(error.response?.data?.message || "Unable to load teachers"); } });
export const fetchSectionsForDropdown = createAsyncThunk("academicModule/fetchSections", async (classId, { rejectWithValue }) => { try { const token = localStorage.getItem("token"); const url = classId ? `${baseUrl}/class-teacher/sections?classId=${classId}` : `${baseUrl}/class-teacher/sections`; const response = await axios.get(url, { headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` } }); return response.data.data || []; } catch (error) { return rejectWithValue(error.response?.data?.message || "Unable to load sections"); } });
const slice = createSlice({ name: "academicModule", initialState: { modules: {}, loading: false, error: null, dropdownData: { classes: [], teachers: [], sections: [] } }, reducers: {}, extraReducers: (builder) => {
  builder.addCase(fetchAcademicModule.pending, (state, action) => { state.loading = true; state.error = null; state.modules[action.meta.arg] = []; });
  builder.addCase(fetchAcademicModule.fulfilled, (state, action) => { state.loading = false; state.modules[action.payload.module] = action.payload.records; });
  builder.addCase(fetchAcademicModule.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message || "Unable to load academic records"; });
  builder.addCase(createAcademicRecord.fulfilled, (state, action) => { const rows = state.modules[action.payload.module] || []; state.modules[action.payload.module] = [...rows, action.payload.record]; });
  builder.addCase(updateAcademicRecord.fulfilled, (state, action) => { const rows = state.modules[action.payload.module] || []; const index = rows.findIndex((row) => row._id === action.payload.record._id); if (index >= 0) rows[index] = action.payload.record; });
  builder.addCase(deleteAcademicRecord.fulfilled, (state, action) => { state.modules[action.payload.module] = (state.modules[action.payload.module] || []).filter((row) => row._id !== action.payload.id); });
  builder.addCase(fetchClassesForDropdown.fulfilled, (state, action) => { state.dropdownData.classes = action.payload; });
  builder.addCase(fetchTeachersForDropdown.fulfilled, (state, action) => { state.dropdownData.teachers = action.payload; });
  builder.addCase(fetchSectionsForDropdown.fulfilled, (state, action) => { state.dropdownData.sections = action.payload; });
}});
export default slice.reducer;
