import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/** Search students for fee collection */
export const fetchFeeStudents = createAsyncThunk(
  "feeCollection/fetchFeeStudents",
  async (params = {}, { rejectWithValue }) => {
    try {
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
      );
      console.log('Fetching students with params:', clean);
      const res = await axios.get("/api/fee-collection/search-students", { params: clean });
      console.log('Students response:', res.data);
      return res.data;
    } catch (err) {
      console.error('Fetch students error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get student fee details */
export const getStudentFeeDetails = createAsyncThunk(
  "feeCollection/getStudentFeeDetails",
  async (studentId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/fee-collection/student/${studentId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get student fees for collection page */
export const getStudentFeesForCollection = createAsyncThunk(
  "feeCollection/getStudentFeesForCollection",
  async (studentId, { rejectWithValue }) => {
    try {
      console.log('📋 Fetching student fees for collection:', studentId);
      const res = await axios.get(`/api/fee-collection/student-fees/${studentId}`);
      console.log('✅ Student fees response:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Student fees fetch error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Collect fee */
export const collectFee = createAsyncThunk(
  "feeCollection/collectFee",
  async ({ studentId, ...feeData }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/fee-collection/collect/${studentId}`, feeData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get student receipts */
export const getStudentReceipts = createAsyncThunk(
  "feeCollection/getStudentReceipts",
  async (studentId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/fee-collection/receipts/${studentId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get all classes */
export const getAllClasses = createAsyncThunk(
  "feeCollection/getAllClasses",
  async (_, { rejectWithValue }) => {
    try {
      console.log('📚 Fetching classes from /api/fee-collection/classes');
      const res = await axios.get("/api/fee-collection/classes");
      console.log('✅ Classes response:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Classes fetch error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get demand bills */
export const getDemandBills = createAsyncThunk(
  "feeCollection/getDemandBills",
  async (params = {}, { rejectWithValue }) => {
    try {
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
      );
      console.log('📋 Fetching demand bills with params:', clean);
      const res = await axios.get("/api/fee-collection/demand-bills", { params: clean });
      console.log('✅ Demand bills response:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Demand bills fetch error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get fee groups */
export const getFeeGroups = createAsyncThunk(
  "feeCollection/getFeeGroups",
  async (_, { rejectWithValue }) => {
    try {
      console.log('📁 Fetching fee groups');
      const res = await axios.get("/api/fee-collection/fee-groups");
      console.log('✅ Fee groups response:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Fee groups fetch error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get offline bank payments */
export const getOfflineBankPayments = createAsyncThunk(
  "feeCollection/getOfflineBankPayments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
      );
      console.log('💳 Fetching offline bank payments with params:', clean);
      const res = await axios.get("/api/fee-collection/offline-bank-payments", { params: clean });
      console.log('✅ Offline bank payments response:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Offline bank payments fetch error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Create offline bank payment */
export const createOfflineBankPayment = createAsyncThunk(
  "feeCollection/createOfflineBankPayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      console.log('💳 Creating offline bank payment:', paymentData);
      const res = await axios.post("/api/fee-collection/offline-bank-payment", paymentData);
      console.log('✅ Offline bank payment created:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Create offline bank payment error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Update offline bank payment status */
export const updateOfflineBankPaymentStatus = createAsyncThunk(
  "feeCollection/updateOfflineBankPaymentStatus",
  async ({ paymentId, ...statusData }, { rejectWithValue }) => {
    try {
      console.log('💳 Updating offline bank payment status:', paymentId, statusData);
      const res = await axios.put(`/api/fee-collection/offline-bank-payment/${paymentId}/status`, statusData);
      console.log('✅ Offline bank payment status updated:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Update offline bank payment status error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Search fee payments */
export const searchFeePayments = createAsyncThunk(
  "feeCollection/searchFeePayments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
      );
      console.log('🔍 Searching fee payments with params:', clean);
      const res = await axios.get("/api/fee-collection/search-payments", { params: clean });
      console.log('✅ Fee payments search response:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Fee payments search error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get payment details */
export const getPaymentDetails = createAsyncThunk(
  "feeCollection/getPaymentDetails",
  async (paymentId, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching payment details:', paymentId);
      const res = await axios.get(`/api/fee-collection/payment/${paymentId}`);
      console.log('✅ Payment details response:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Payment details fetch error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Search due fees */
export const searchDueFees = createAsyncThunk(
  "feeCollection/searchDueFees",
  async (params = {}, { rejectWithValue }) => {
    try {
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
      );
      console.log('🔍 Searching due fees with params:', clean);
      const res = await axios.get("/api/fee-collection/search-due-fees", { params: clean });
      console.log('✅ Due fees search response:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Due fees search error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get student demand bill */
export const getStudentDemandBill = createAsyncThunk(
  "feeCollection/getStudentDemandBill",
  async (studentId, { rejectWithValue }) => {
    try {
      console.log('📄 Fetching student demand bill:', studentId);
      const res = await axios.get(`/api/fee-collection/demand-bill/${studentId}`);
      console.log('✅ Demand bill response:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Demand bill fetch error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get all fee masters */
export const getAllFeeMasters = createAsyncThunk(
  "feeCollection/getAllFeeMasters",
  async (params = {}, { rejectWithValue }) => {
    try {
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
      );
      console.log('📋 Fetching fee masters with params:', clean);
      const res = await axios.get("/api/fee-collection/fee-masters", { params: clean });
      console.log('✅ Fee masters response:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Fee masters fetch error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Create fee master */
export const createFeeMaster = createAsyncThunk(
  "feeCollection/createFeeMaster",
  async (feeMasterData, { rejectWithValue }) => {
    try {
      console.log('➕ Creating fee master:', feeMasterData);
      const res = await axios.post("/api/fee-collection/fee-master", feeMasterData);
      console.log('✅ Fee master created:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Create fee master error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Update fee master */
export const updateFeeMaster = createAsyncThunk(
  "feeCollection/updateFeeMaster",
  async ({ feeMasterId, ...feeMasterData }, { rejectWithValue }) => {
    try {
      console.log('✏️ Updating fee master:', feeMasterId, feeMasterData);
      const res = await axios.put(`/api/fee-collection/fee-master/${feeMasterId}`, feeMasterData);
      console.log('✅ Fee master updated:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Update fee master error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Delete fee master */
export const deleteFeeMaster = createAsyncThunk(
  "feeCollection/deleteFeeMaster",
  async (feeMasterId, { rejectWithValue }) => {
    try {
      console.log('🗑️ Deleting fee master:', feeMasterId);
      const res = await axios.delete(`/api/fee-collection/fee-master/${feeMasterId}`);
      console.log('✅ Fee master deleted:', res.data);
      return { ...res.data, feeMasterId };
    } catch (err) {
      console.error('❌ Delete fee master error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get fee master by ID */
export const getFeeMasterById = createAsyncThunk(
  "feeCollection/getFeeMasterById",
  async (feeMasterId, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching fee master by ID:', feeMasterId);
      const res = await axios.get(`/api/fee-collection/fee-master/${feeMasterId}`);
      console.log('✅ Fee master response:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Fee master fetch error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get all fee groups with pagination */
export const getAllFeeGroupsPaginated = createAsyncThunk(
  "feeCollection/getAllFeeGroupsPaginated",
  async (params = {}, { rejectWithValue }) => {
    try {
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
      );
      console.log('📋 Fetching fee groups with params:', clean);
      const res = await axios.get("/api/fee-collection/fee-groups-paginated", { params: clean });
      console.log('✅ Fee groups response:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Fee groups fetch error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Create fee group */
export const createFeeGroup = createAsyncThunk(
  "feeCollection/createFeeGroup",
  async (feeGroupData, { rejectWithValue }) => {
    try {
      console.log('➕ Creating fee group:', feeGroupData);
      const res = await axios.post("/api/fee-collection/fee-group", feeGroupData);
      console.log('✅ Fee group created:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Create fee group error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Update fee group */
export const updateFeeGroup = createAsyncThunk(
  "feeCollection/updateFeeGroup",
  async ({ feeGroupId, ...feeGroupData }, { rejectWithValue }) => {
    try {
      console.log('✏️ Updating fee group:', feeGroupId, feeGroupData);
      const res = await axios.put(`/api/fee-collection/fee-group/${feeGroupId}`, feeGroupData);
      console.log('✅ Fee group updated:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Update fee group error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Delete fee group */
export const deleteFeeGroup = createAsyncThunk(
  "feeCollection/deleteFeeGroup",
  async (feeGroupId, { rejectWithValue }) => {
    try {
      console.log('🗑️ Deleting fee group:', feeGroupId);
      const res = await axios.delete(`/api/fee-collection/fee-group/${feeGroupId}`);
      console.log('✅ Fee group deleted:', res.data);
      return { ...res.data, feeGroupId };
    } catch (err) {
      console.error('❌ Delete fee group error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get fee group by ID */
export const getFeeGroupById = createAsyncThunk(
  "feeCollection/getFeeGroupById",
  async (feeGroupId, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching fee group by ID:', feeGroupId);
      const res = await axios.get(`/api/fee-collection/fee-group/${feeGroupId}`);
      console.log('✅ Fee group response:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Fee group fetch error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get all fee types with pagination */
export const getAllFeeTypesPaginated = createAsyncThunk(
  "feeCollection/getAllFeeTypesPaginated",
  async (params = {}, { rejectWithValue }) => {
    try {
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
      );
      console.log('📋 Fetching fee types with params:', clean);
      const res = await axios.get("/api/fee-collection/fee-types-paginated", { params: clean });
      console.log('✅ Fee types response:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Fee types fetch error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Create fee type */
export const createFeeType = createAsyncThunk(
  "feeCollection/createFeeType",
  async (feeTypeData, { rejectWithValue }) => {
    try {
      console.log('➕ Creating fee type:', feeTypeData);
      const res = await axios.post("/api/fee-collection/fee-type", feeTypeData);
      console.log('✅ Fee type created:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Create fee type error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Update fee type */
export const updateFeeType = createAsyncThunk(
  "feeCollection/updateFeeType",
  async ({ feeTypeId, ...feeTypeData }, { rejectWithValue }) => {
    try {
      console.log('✏️ Updating fee type:', feeTypeId, feeTypeData);
      const res = await axios.put(`/api/fee-collection/fee-type/${feeTypeId}`, feeTypeData);
      console.log('✅ Fee type updated:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Update fee type error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Delete fee type */
export const deleteFeeType = createAsyncThunk(
  "feeCollection/deleteFeeType",
  async (feeTypeId, { rejectWithValue }) => {
    try {
      console.log('🗑️ Deleting fee type:', feeTypeId);
      const res = await axios.delete(`/api/fee-collection/fee-type/${feeTypeId}`);
      console.log('✅ Fee type deleted:', res.data);
      return { ...res.data, feeTypeId };
    } catch (err) {
      console.error('❌ Delete fee type error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get fee type by ID */
export const getFeeTypeById = createAsyncThunk(
  "feeCollection/getFeeTypeById",
  async (feeTypeId, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching fee type by ID:', feeTypeId);
      const res = await axios.get(`/api/fee-collection/fee-type/${feeTypeId}`);
      console.log('✅ Fee type response:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Fee type fetch error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Collect single fee */
export const collectSingleFee = createAsyncThunk(
  "feeCollection/collectSingleFee",
  async ({ feeAssignmentId, ...feeData }, { rejectWithValue }) => {
    try {
      console.log('💰 Collecting single fee:', feeAssignmentId, feeData);
      const res = await axios.post(`/api/fee-collection/collect-single-fee/${feeAssignmentId}`, feeData);
      console.log('✅ Fee collected:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Collect fee error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Collect multiple fees */
export const collectMultipleFees = createAsyncThunk(
  "feeCollection/collectMultipleFees",
  async (feeData, { rejectWithValue }) => {
    try {
      console.log('💰 Collecting multiple fees:', feeData);
      const res = await axios.post('/api/fee-collection/collect-multiple-fees', feeData);
      console.log('✅ Multiple fees collected:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Collect multiple fees error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get fee assignment payments */
export const getFeeAssignmentPayments = createAsyncThunk(
  "feeCollection/getFeeAssignmentPayments",
  async (feeAssignmentId, { rejectWithValue }) => {
    try {
      console.log('📋 Fetching fee assignment payments:', feeAssignmentId);
      const res = await axios.get(`/api/fee-collection/fee-assignment-payments/${feeAssignmentId}`);
      console.log('✅ Payments fetched:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Fetch payments error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get student all receipts */
export const getStudentAllReceipts = createAsyncThunk(
  "feeCollection/getStudentAllReceipts",
  async (studentId, { rejectWithValue }) => {
    try {
      console.log('🧾 Fetching student receipts:', studentId);
      const res = await axios.get(`/api/fee-collection/student-receipts/${studentId}`);
      console.log('✅ Receipts fetched:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Fetch receipts error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get receipt details */
export const getReceiptDetails = createAsyncThunk(
  "feeCollection/getReceiptDetails",
  async (receiptId, { rejectWithValue }) => {
    try {
      console.log('🧾 Fetching receipt details:', receiptId);
      const res = await axios.get(`/api/fee-collection/receipt/${receiptId}`);
      console.log('✅ Receipt details fetched:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Fetch receipt details error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Revert payment */
export const revertPayment = createAsyncThunk(
  "feeCollection/revertPayment",
  async (paymentId, { rejectWithValue }) => {
    try {
      console.log('↩️ Reverting payment:', paymentId);
      const res = await axios.delete(`/api/fee-collection/revert-payment/${paymentId}`);
      console.log('✅ Payment reverted:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Revert payment error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Get discount groups */
export const getDiscountGroups = createAsyncThunk(
  "feeCollection/getDiscountGroups",
  async (_, { rejectWithValue }) => {
    try {
      console.log('🏷️ Fetching discount groups');
      const res = await axios.get('/api/fee-collection/discount-groups');
      console.log('✅ Discount groups fetched:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Fetch discount groups error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Assign fee to students */
export const assignFeeToStudents = createAsyncThunk(
  "feeCollection/assignFeeToStudents",
  async (assignmentData, { rejectWithValue }) => {
    try {
      console.log('📝 Assigning fee to students:', assignmentData);
      const res = await axios.post('/api/fee-collection/assign-fee', assignmentData);
      console.log('✅ Fee assigned:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Assign fee error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  // Student Search
  students: [],
  studentsPagination: { total: 0, page: 1, limit: 10, pages: 0 },
  studentsLoading: false,

  // Selected Student
  selectedStudent: null,
  studentFeeDetails: null,
  studentFeeLoading: false,

  // Student Fees for Collection Page
  studentFeesForCollection: null,
  feeAssignments: [],
  feeSummary: null,
  studentFeesLoading: false,

  // Classes
  classes: [],
  classesLoading: false,

  // Fee Groups
  feeGroups: [],
  feeGroupsLoading: false,

  // Demand Bills
  demandBills: [],
  demandBillsPagination: { total: 0, page: 1, limit: 10, pages: 0 },
  demandBillsLoading: false,

  // Offline Bank Payments
  offlineBankPayments: [],
  offlineBankPaymentsPagination: { total: 0, page: 1, limit: 100, pages: 0 },
  offlineBankPaymentsLoading: false,

  // Search Fee Payments
  searchedPayments: [],
  searchedPaymentsPagination: { total: 0, page: 1, limit: 10, pages: 0 },
  searchedPaymentsLoading: false,
  selectedPaymentDetails: null,
  paymentDetailsLoading: false,

  // Search Due Fees
  dueFees: [],
  dueFeesPagination: { total: 0, page: 1, limit: 10, pages: 0 },
  dueFeesLoading: false,

  // Student Demand Bill
  demandBillDetails: null,
  demandBillLoading: false,

  // Fee Masters
  feeMasters: [],
  feeMastersPagination: { total: 0, page: 1, limit: 10, pages: 0 },
  feeMastersLoading: false,
  selectedFeeMaster: null,
  feeMasterLoading: false,

  // Fee Groups
  feeGroupsPaginated: [],
  feeGroupsPagination: { total: 0, page: 1, limit: 10, pages: 0 },
  feeGroupsLoading: false,
  selectedFeeGroup: null,
  feeGroupLoading: false,

  // Fee Types
  feeTypesPaginated: [],
  feeTypesPagination: { total: 0, page: 1, limit: 10, pages: 0 },
  feeTypesLoading: false,
  selectedFeeType: null,
  feeTypeLoading: false,

  // Receipts
  receipts: [],
  receiptsLoading: false,

  // Fee Payments
  feePayments: [],
  feePaymentsLoading: false,
  selectedReceipt: null,
  receiptLoading: false,

  // Discount Groups
  discountGroups: [],
  discountGroupsLoading: false,

  // Filters
  filters: {
    search: "",
    classId: "",
    section: "",
    page: 1,
    limit: 10,
  },

  // UI State
  submitLoading: false,
  error: null,
  successMsg: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const feeCollectionSlice = createSlice({
  name: "feeCollection",
  initialState,
  reducers: {
    setFeeFilters(state, action) {
      console.log('setFeeFilters called with:', action.payload);
      const isPageChange = Object.keys(action.payload).length === 1 && 
                          (action.payload.page !== undefined || action.payload.limit !== undefined);
      console.log('Is page change?', isPageChange);
      state.filters = {
        ...state.filters,
        ...action.payload,
        ...(isPageChange ? {} : { page: 1 }),
      };
      console.log('New filters:', state.filters);
    },
    setSelectedStudent(state, action) {
      state.selectedStudent = action.payload;
    },
    clearSelectedStudent(state) {
      state.selectedStudent = null;
      state.studentFeeDetails = null;
    },
    clearFeeMessages(state) {
      state.error = null;
      state.successMsg = null;
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    // ── fetchFeeStudents ───────────────────────────────────────────────────
    builder
      .addCase(fetchFeeStudents.pending, (state) => {
        state.studentsLoading = true;
        state.error = null;
        console.log('⏳ Fetching students...');
      })
      .addCase(fetchFeeStudents.fulfilled, (state, action) => {
        state.studentsLoading = false;
        state.students = action.payload.data || [];
        state.studentsPagination = action.payload.pagination || state.studentsPagination;
        console.log('✅ Students loaded:', {
          count: state.students.length,
          pagination: state.studentsPagination
        });
      })
      .addCase(fetchFeeStudents.rejected, (state, action) => {
        state.studentsLoading = false;
        state.error = action.payload || "Failed to search students";
        console.error('❌ Students fetch failed:', action.payload);
      });

    // ── getStudentFeeDetails ───────────────────────────────────────────────
    builder
      .addCase(getStudentFeeDetails.pending, (state) => {
        state.studentFeeLoading = true;
        state.error = null;
      })
      .addCase(getStudentFeeDetails.fulfilled, (state, action) => {
        state.studentFeeLoading = false;
        state.studentFeeDetails = action.payload.data;
      })
      .addCase(getStudentFeeDetails.rejected, (state, action) => {
        state.studentFeeLoading = false;
        state.error = action.payload || "Failed to get student fee details";
      });

    // ── getStudentFeesForCollection ────────────────────────────────────────
    builder
      .addCase(getStudentFeesForCollection.pending, (state) => {
        state.studentFeesLoading = true;
        state.error = null;
        console.log('⏳ Loading student fees for collection...');
      })
      .addCase(getStudentFeesForCollection.fulfilled, (state, action) => {
        state.studentFeesLoading = false;
        state.studentFeesForCollection = action.payload.data.student;
        state.feeAssignments = action.payload.data.feeAssignments || [];
        state.feeSummary = action.payload.data.summary;
        console.log('✅ Student fees loaded:', {
          student: state.studentFeesForCollection,
          assignments: state.feeAssignments.length,
          summary: state.feeSummary
        });
      })
      .addCase(getStudentFeesForCollection.rejected, (state, action) => {
        state.studentFeesLoading = false;
        state.error = action.payload || "Failed to get student fees";
        console.error('❌ Student fees loading failed:', action.payload);
      });

    // ── collectFee ─────────────────────────────────────────────────────────
    builder
      .addCase(collectFee.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(collectFee.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Fee collected successfully";
      })
      .addCase(collectFee.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to collect fee";
      });

    // ── getStudentReceipts ─────────────────────────────────────────────────
    builder
      .addCase(getStudentReceipts.pending, (state) => {
        state.receiptsLoading = true;
        state.error = null;
      })
      .addCase(getStudentReceipts.fulfilled, (state, action) => {
        state.receiptsLoading = false;
        state.receipts = action.payload.data || [];
      })
      .addCase(getStudentReceipts.rejected, (state, action) => {
        state.receiptsLoading = false;
        state.error = action.payload || "Failed to get receipts";
      });

    // ── getAllClasses ──────────────────────────────────────────────────────
    builder
      .addCase(getAllClasses.pending, (state) => {
        state.classesLoading = true;
        console.log('⏳ Classes loading...');
      })
      .addCase(getAllClasses.fulfilled, (state, action) => {
        state.classesLoading = false;
        state.classes = action.payload.data || [];
        console.log('✅ Classes loaded:', state.classes.length);
      })
      .addCase(getAllClasses.rejected, (state, action) => {
        state.classesLoading = false;
        state.error = action.payload || "Failed to load classes";
        console.error('❌ Classes loading failed:', action.payload);
      });

    // ── getDemandBills ─────────────────────────────────────────────────────
    builder
      .addCase(getDemandBills.pending, (state) => {
        state.demandBillsLoading = true;
        state.error = null;
        console.log('⏳ Demand bills loading...');
      })
      .addCase(getDemandBills.fulfilled, (state, action) => {
        state.demandBillsLoading = false;
        state.demandBills = action.payload.data || [];
        state.demandBillsPagination = action.payload.pagination || state.demandBillsPagination;
        console.log('✅ Demand bills loaded:', {
          count: state.demandBills.length,
          pagination: state.demandBillsPagination
        });
      })
      .addCase(getDemandBills.rejected, (state, action) => {
        state.demandBillsLoading = false;
        state.error = action.payload || "Failed to fetch demand bills";
        console.error('❌ Demand bills loading failed:', action.payload);
      });

    // ── getFeeGroups ───────────────────────────────────────────────────────
    builder
      .addCase(getFeeGroups.pending, (state) => {
        state.feeGroupsLoading = true;
        console.log('⏳ Fee groups loading...');
      })
      .addCase(getFeeGroups.fulfilled, (state, action) => {
        state.feeGroupsLoading = false;
        state.feeGroups = action.payload.data || [];
        console.log('✅ Fee groups loaded:', state.feeGroups.length);
      })
      .addCase(getFeeGroups.rejected, (state, action) => {
        state.feeGroupsLoading = false;
        console.error('❌ Fee groups loading failed:', action.payload);
      });

    // ── getOfflineBankPayments ─────────────────────────────────────────────
    builder
      .addCase(getOfflineBankPayments.pending, (state) => {
        state.offlineBankPaymentsLoading = true;
        state.error = null;
        console.log('⏳ Offline bank payments loading...');
      })
      .addCase(getOfflineBankPayments.fulfilled, (state, action) => {
        state.offlineBankPaymentsLoading = false;
        state.offlineBankPayments = action.payload.data || [];
        state.offlineBankPaymentsPagination = action.payload.pagination || state.offlineBankPaymentsPagination;
        console.log('✅ Offline bank payments loaded:', {
          count: state.offlineBankPayments.length,
          pagination: state.offlineBankPaymentsPagination
        });
      })
      .addCase(getOfflineBankPayments.rejected, (state, action) => {
        state.offlineBankPaymentsLoading = false;
        state.error = action.payload || "Failed to fetch offline bank payments";
        console.error('❌ Offline bank payments loading failed:', action.payload);
      });

    // ── createOfflineBankPayment ───────────────────────────────────────────
    builder
      .addCase(createOfflineBankPayment.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(createOfflineBankPayment.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Offline bank payment created successfully";
      })
      .addCase(createOfflineBankPayment.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to create offline bank payment";
      });

    // ── updateOfflineBankPaymentStatus ─────────────────────────────────────
    builder
      .addCase(updateOfflineBankPaymentStatus.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(updateOfflineBankPaymentStatus.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Payment status updated successfully";
      })
      .addCase(updateOfflineBankPaymentStatus.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to update payment status";
      });

    // ── searchFeePayments ──────────────────────────────────────────────────
    builder
      .addCase(searchFeePayments.pending, (state) => {
        state.searchedPaymentsLoading = true;
        state.error = null;
        console.log('⏳ Searching fee payments...');
      })
      .addCase(searchFeePayments.fulfilled, (state, action) => {
        state.searchedPaymentsLoading = false;
        state.searchedPayments = action.payload.data || [];
        state.searchedPaymentsPagination = action.payload.pagination || state.searchedPaymentsPagination;
        console.log('✅ Fee payments search completed:', {
          count: state.searchedPayments.length,
          pagination: state.searchedPaymentsPagination
        });
      })
      .addCase(searchFeePayments.rejected, (state, action) => {
        state.searchedPaymentsLoading = false;
        state.error = action.payload || "Failed to search fee payments";
        console.error('❌ Fee payments search failed:', action.payload);
      });

    // ── getPaymentDetails ──────────────────────────────────────────────────
    builder
      .addCase(getPaymentDetails.pending, (state) => {
        state.paymentDetailsLoading = true;
        state.error = null;
        console.log('⏳ Fetching payment details...');
      })
      .addCase(getPaymentDetails.fulfilled, (state, action) => {
        state.paymentDetailsLoading = false;
        state.selectedPaymentDetails = action.payload.data;
        console.log('✅ Payment details loaded');
      })
      .addCase(getPaymentDetails.rejected, (state, action) => {
        state.paymentDetailsLoading = false;
        state.error = action.payload || "Failed to fetch payment details";
        console.error('❌ Payment details fetch failed:', action.payload);
      });

    // ── searchDueFees ──────────────────────────────────────────────────────
    builder
      .addCase(searchDueFees.pending, (state) => {
        state.dueFeesLoading = true;
        state.error = null;
        console.log('⏳ Searching due fees...');
      })
      .addCase(searchDueFees.fulfilled, (state, action) => {
        state.dueFeesLoading = false;
        state.dueFees = action.payload.data || [];
        state.dueFeesPagination = action.payload.pagination || state.dueFeesPagination;
        console.log('✅ Due fees loaded:', {
          count: state.dueFees.length,
          pagination: state.dueFeesPagination
        });
      })
      .addCase(searchDueFees.rejected, (state, action) => {
        state.dueFeesLoading = false;
        state.error = action.payload || "Failed to search due fees";
        console.error('❌ Due fees search failed:', action.payload);
      });

    // ── getStudentDemandBill ───────────────────────────────────────────────
    builder
      .addCase(getStudentDemandBill.pending, (state) => {
        state.demandBillLoading = true;
        state.error = null;
        console.log('⏳ Fetching demand bill...');
      })
      .addCase(getStudentDemandBill.fulfilled, (state, action) => {
        state.demandBillLoading = false;
        state.demandBillDetails = action.payload.data;
        console.log('✅ Demand bill loaded');
      })
      .addCase(getStudentDemandBill.rejected, (state, action) => {
        state.demandBillLoading = false;
        state.error = action.payload || "Failed to fetch demand bill";
        console.error('❌ Demand bill fetch failed:', action.payload);
      });

    // ── getAllFeeMasters ───────────────────────────────────────────────────
    builder
      .addCase(getAllFeeMasters.pending, (state) => {
        state.feeMastersLoading = true;
        state.error = null;
        console.log('⏳ Fetching fee masters...');
      })
      .addCase(getAllFeeMasters.fulfilled, (state, action) => {
        state.feeMastersLoading = false;
        state.feeMasters = action.payload.data || [];
        state.feeMastersPagination = action.payload.pagination || state.feeMastersPagination;
        console.log('✅ Fee masters loaded:', state.feeMasters.length);
      })
      .addCase(getAllFeeMasters.rejected, (state, action) => {
        state.feeMastersLoading = false;
        state.error = action.payload || "Failed to fetch fee masters";
        console.error('❌ Fee masters fetch failed:', action.payload);
      });

    // ── createFeeMaster ────────────────────────────────────────────────────
    builder
      .addCase(createFeeMaster.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(createFeeMaster.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Fee master created successfully";
      })
      .addCase(createFeeMaster.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to create fee master";
      });

    // ── updateFeeMaster ────────────────────────────────────────────────────
    builder
      .addCase(updateFeeMaster.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(updateFeeMaster.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Fee master updated successfully";
      })
      .addCase(updateFeeMaster.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to update fee master";
      });

    // ── deleteFeeMaster ────────────────────────────────────────────────────
    builder
      .addCase(deleteFeeMaster.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(deleteFeeMaster.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Fee master deleted successfully";
        // Remove from list
        state.feeMasters = state.feeMasters.filter(fm => fm._id !== action.payload.feeMasterId);
      })
      .addCase(deleteFeeMaster.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to delete fee master";
      });

    // ── getFeeMasterById ───────────────────────────────────────────────────
    builder
      .addCase(getFeeMasterById.pending, (state) => {
        state.feeMasterLoading = true;
        state.error = null;
      })
      .addCase(getFeeMasterById.fulfilled, (state, action) => {
        state.feeMasterLoading = false;
        state.selectedFeeMaster = action.payload.data;
      })
      .addCase(getFeeMasterById.rejected, (state, action) => {
        state.feeMasterLoading = false;
        state.error = action.payload || "Failed to fetch fee master";
      });

    // ── getAllFeeGroupsPaginated ───────────────────────────────────────────
    builder
      .addCase(getAllFeeGroupsPaginated.pending, (state) => {
        state.feeGroupsLoading = true;
        state.error = null;
        console.log('⏳ Fetching fee groups...');
      })
      .addCase(getAllFeeGroupsPaginated.fulfilled, (state, action) => {
        state.feeGroupsLoading = false;
        state.feeGroupsPaginated = action.payload.data || [];
        state.feeGroupsPagination = action.payload.pagination || state.feeGroupsPagination;
        console.log('✅ Fee groups loaded:', state.feeGroupsPaginated.length);
      })
      .addCase(getAllFeeGroupsPaginated.rejected, (state, action) => {
        state.feeGroupsLoading = false;
        state.error = action.payload || "Failed to fetch fee groups";
        console.error('❌ Fee groups fetch failed:', action.payload);
      });

    // ── createFeeGroup ─────────────────────────────────────────────────────
    builder
      .addCase(createFeeGroup.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(createFeeGroup.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Fee group created successfully";
      })
      .addCase(createFeeGroup.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to create fee group";
      });

    // ── updateFeeGroup ─────────────────────────────────────────────────────
    builder
      .addCase(updateFeeGroup.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(updateFeeGroup.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Fee group updated successfully";
      })
      .addCase(updateFeeGroup.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to update fee group";
      });

    // ── deleteFeeGroup ─────────────────────────────────────────────────────
    builder
      .addCase(deleteFeeGroup.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(deleteFeeGroup.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Fee group deleted successfully";
        // Remove from list
        state.feeGroupsPaginated = state.feeGroupsPaginated.filter(fg => fg._id !== action.payload.feeGroupId);
      })
      .addCase(deleteFeeGroup.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to delete fee group";
      });

    // ── getFeeGroupById ────────────────────────────────────────────────────
    builder
      .addCase(getFeeGroupById.pending, (state) => {
        state.feeGroupLoading = true;
        state.error = null;
      })
      .addCase(getFeeGroupById.fulfilled, (state, action) => {
        state.feeGroupLoading = false;
        state.selectedFeeGroup = action.payload.data;
      })
      .addCase(getFeeGroupById.rejected, (state, action) => {
        state.feeGroupLoading = false;
        state.error = action.payload || "Failed to fetch fee group";
      });

    // ── getAllFeeTypesPaginated ────────────────────────────────────────────
    builder
      .addCase(getAllFeeTypesPaginated.pending, (state) => {
        state.feeTypesLoading = true;
        state.error = null;
        console.log('⏳ Fetching fee types...');
      })
      .addCase(getAllFeeTypesPaginated.fulfilled, (state, action) => {
        state.feeTypesLoading = false;
        state.feeTypesPaginated = action.payload.data || [];
        state.feeTypesPagination = action.payload.pagination || state.feeTypesPagination;
        console.log('✅ Fee types loaded:', state.feeTypesPaginated.length);
      })
      .addCase(getAllFeeTypesPaginated.rejected, (state, action) => {
        state.feeTypesLoading = false;
        state.error = action.payload || "Failed to fetch fee types";
        console.error('❌ Fee types fetch failed:', action.payload);
      });

    // ── createFeeType ──────────────────────────────────────────────────────
    builder
      .addCase(createFeeType.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(createFeeType.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Fee type created successfully";
      })
      .addCase(createFeeType.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to create fee type";
      });

    // ── updateFeeType ──────────────────────────────────────────────────────
    builder
      .addCase(updateFeeType.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(updateFeeType.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Fee type updated successfully";
      })
      .addCase(updateFeeType.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to update fee type";
      });

    // ── deleteFeeType ──────────────────────────────────────────────────────
    builder
      .addCase(deleteFeeType.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(deleteFeeType.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Fee type deleted successfully";
        // Remove from list
        state.feeTypesPaginated = state.feeTypesPaginated.filter(ft => ft._id !== action.payload.feeTypeId);
      })
      .addCase(deleteFeeType.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to delete fee type";
      });

    // ── getFeeTypeById ─────────────────────────────────────────────────────
    builder
      .addCase(getFeeTypeById.pending, (state) => {
        state.feeTypeLoading = true;
        state.error = null;
      })
      .addCase(getFeeTypeById.fulfilled, (state, action) => {
        state.feeTypeLoading = false;
        state.selectedFeeType = action.payload.data;
      })
      .addCase(getFeeTypeById.rejected, (state, action) => {
        state.feeTypeLoading = false;
        state.error = action.payload || "Failed to fetch fee type";
      });

    // ── collectSingleFee ───────────────────────────────────────────────────
    builder
      .addCase(collectSingleFee.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(collectSingleFee.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Fee collected successfully";
      })
      .addCase(collectSingleFee.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to collect fee";
      });

    // ── collectMultipleFees ────────────────────────────────────────────────
    builder
      .addCase(collectMultipleFees.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(collectMultipleFees.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Fees collected successfully";
      })
      .addCase(collectMultipleFees.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to collect fees";
      });

    // ── getFeeAssignmentPayments ───────────────────────────────────────────
    builder
      .addCase(getFeeAssignmentPayments.pending, (state) => {
        state.feePaymentsLoading = true;
        state.error = null;
      })
      .addCase(getFeeAssignmentPayments.fulfilled, (state, action) => {
        state.feePaymentsLoading = false;
        state.feePayments = action.payload.data || [];
      })
      .addCase(getFeeAssignmentPayments.rejected, (state, action) => {
        state.feePaymentsLoading = false;
        state.error = action.payload || "Failed to fetch payments";
      });

    // ── getStudentAllReceipts ──────────────────────────────────────────────
    builder
      .addCase(getStudentAllReceipts.pending, (state) => {
        state.receiptsLoading = true;
        state.error = null;
      })
      .addCase(getStudentAllReceipts.fulfilled, (state, action) => {
        state.receiptsLoading = false;
        state.receipts = action.payload.data || [];
      })
      .addCase(getStudentAllReceipts.rejected, (state, action) => {
        state.receiptsLoading = false;
        state.error = action.payload || "Failed to fetch receipts";
      });

    // ── getReceiptDetails ──────────────────────────────────────────────────
    builder
      .addCase(getReceiptDetails.pending, (state) => {
        state.receiptLoading = true;
        state.error = null;
      })
      .addCase(getReceiptDetails.fulfilled, (state, action) => {
        state.receiptLoading = false;
        state.selectedReceipt = action.payload.data;
      })
      .addCase(getReceiptDetails.rejected, (state, action) => {
        state.receiptLoading = false;
        state.error = action.payload || "Failed to fetch receipt details";
      });

    // ── revertPayment ──────────────────────────────────────────────────────
    builder
      .addCase(revertPayment.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(revertPayment.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Payment reverted successfully";
      })
      .addCase(revertPayment.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to revert payment";
      });

    // ── getDiscountGroups ──────────────────────────────────────────────────
    builder
      .addCase(getDiscountGroups.pending, (state) => {
        state.discountGroupsLoading = true;
        state.error = null;
      })
      .addCase(getDiscountGroups.fulfilled, (state, action) => {
        state.discountGroupsLoading = false;
        state.discountGroups = action.payload.data || [];
      })
      .addCase(getDiscountGroups.rejected, (state, action) => {
        state.discountGroupsLoading = false;
        state.error = action.payload || "Failed to fetch discount groups";
      });

    // ── assignFeeToStudents ────────────────────────────────────────────────
    builder
      .addCase(assignFeeToStudents.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(assignFeeToStudents.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMsg = action.payload.message || "Fee assigned successfully";
      })
      .addCase(assignFeeToStudents.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to assign fee";
      });
  },
});

export const { 
  setFeeFilters, 
  setSelectedStudent, 
  clearSelectedStudent, 
  clearFeeMessages, 
  resetFilters 
} = feeCollectionSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectFeeCollectionFilters = (state) => state.feeCollection.filters;

const feeCollectionReducer = feeCollectionSlice.reducer;
export default feeCollectionReducer;
