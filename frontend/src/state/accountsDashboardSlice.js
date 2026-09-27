import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../environment";

// Async thunk to fetch accounts dashboard data
export const fetchAccountsDashboard = createAsyncThunk(
  "accountsDashboard/fetchAccountsDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseUrl}/dashboard/accounts-dashboard`, {
        headers: { Authorization: token },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch accounts dashboard"
      );
    }
  }
);

// Async thunk to fetch fee collection trends
export const fetchFeeCollectionTrends = createAsyncThunk(
  "accountsDashboard/fetchFeeCollectionTrends",
  async (months = 12, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseUrl}/dashboard/fee-collection-trends`, {
        headers: { Authorization: token },
        params: { months },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch fee trends"
      );
    }
  }
);

// Async thunk to fetch recent transactions
export const fetchRecentTransactions = createAsyncThunk(
  "accountsDashboard/fetchRecentTransactions",
  async (limit = 5, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseUrl}/dashboard/recent-transactions`, {
        headers: { Authorization: token },
        params: { limit },
      });
      return response.data.data.transactions;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch transactions"
      );
    }
  }
);

// Async thunk to fetch bank balances
export const fetchBankBalances = createAsyncThunk(
  "accountsDashboard/fetchBankBalances",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseUrl}/dashboard/bank-balances`, {
        headers: { Authorization: token },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch bank balances"
      );
    }
  }
);

// Async thunk to fetch income and expense data
export const fetchIncomeExpenseData = createAsyncThunk(
  "accountsDashboard/fetchIncomeExpenseData",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseUrl}/dashboard/income-expense`, {
        headers: { Authorization: token },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch income/expense data"
      );
    }
  }
);

const accountsDashboardSlice = createSlice({
  name: "accountsDashboard",
  initialState: {
    // Overview stats
    todayCollection: 0,
    thisWeekCollection: 0,
    thisMonthCollection: 0,
    totalPending: 0,

    // Collection summary
    collectionSummary: {
      quarterlyCollection: 0,
      yearlyCollection: 0,
      pendingFees: 0,
      pendingStudents: 0,
      collectionRate: 0,
    },

    // Bank balances
    bankBalances: {
      pettyCash: [],
      banks: [],
      totalBalance: 0,
    },

    // Income/Expense/Balance data
    income: {
      today: { total: 0, cash: 0, bank: 0 },
      last7Days: { total: 0, cash: 0, bank: 0 },
      thisMonth: { total: 0, cash: 0, bank: 0 },
      last6Months: { total: 0, cash: 0, bank: 0 },
      thisSession: { total: 0, cash: 0, bank: 0 },
    },
    expense: {
      today: { total: 0, cash: 0, bank: 0 },
      last7Days: { total: 0, cash: 0, bank: 0 },
      thisMonth: { total: 0, cash: 0, bank: 0 },
      last6Months: { total: 0, cash: 0, bank: 0 },
      thisSession: { total: 0, cash: 0, bank: 0 },
    },
    balance: {
      today: { total: 0, cash: 0, bank: 0 },
      last7Days: { total: 0, cash: 0, bank: 0 },
      thisMonth: { total: 0, cash: 0, bank: 0 },
      last6Months: { total: 0, cash: 0, bank: 0 },
      thisSession: { total: 0, cash: 0, bank: 0 },
    },

    // Fee collection trends (monthly)
    feeCollectionTrends: [],

    // Recent transactions
    recentTransactions: [],

    // Loading states
    loading: false,
    trendsLoading: false,
    transactionsLoading: false,
    bankBalancesLoading: false,
    incomeExpenseLoading: false,

    // Error states
    error: null,
    trendsError: null,
    transactionsError: null,
    bankBalancesError: null,
    incomeExpenseError: null,
  },
  reducers: {
    // Clear all data
    clearAccountsDashboard: (state) => {
      state.todayCollection = 0;
      state.thisWeekCollection = 0;
      state.thisMonthCollection = 0;
      state.totalPending = 0;
      state.recentTransactions = [];
      state.feeCollectionTrends = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Accounts Dashboard
    builder
      .addCase(fetchAccountsDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountsDashboard.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        state.todayCollection = data.todayCollection || 0;
        state.thisWeekCollection = data.thisWeekCollection || 0;
        state.thisMonthCollection = data.thisMonthCollection || 0;
        state.totalPending = data.totalPending || 0;
        state.collectionSummary = data.collectionSummary || state.collectionSummary;
      })
      .addCase(fetchAccountsDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Fee Collection Trends
    builder
      .addCase(fetchFeeCollectionTrends.pending, (state) => {
        state.trendsLoading = true;
        state.trendsError = null;
      })
      .addCase(fetchFeeCollectionTrends.fulfilled, (state, action) => {
        state.trendsLoading = false;
        state.feeCollectionTrends = action.payload.trends || [];
      })
      .addCase(fetchFeeCollectionTrends.rejected, (state, action) => {
        state.trendsLoading = false;
        state.trendsError = action.payload;
      });

    // Fetch Recent Transactions
    builder
      .addCase(fetchRecentTransactions.pending, (state) => {
        state.transactionsLoading = true;
        state.transactionsError = null;
      })
      .addCase(fetchRecentTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false;
        state.recentTransactions = action.payload;
      })
      .addCase(fetchRecentTransactions.rejected, (state, action) => {
        state.transactionsLoading = false;
        state.transactionsError = action.payload;
      });

    // Fetch Bank Balances
    builder
      .addCase(fetchBankBalances.pending, (state) => {
        state.bankBalancesLoading = true;
        state.bankBalancesError = null;
      })
      .addCase(fetchBankBalances.fulfilled, (state, action) => {
        state.bankBalancesLoading = false;
        state.bankBalances = action.payload;
      })
      .addCase(fetchBankBalances.rejected, (state, action) => {
        state.bankBalancesLoading = false;
        state.bankBalancesError = action.payload;
      });

    // Fetch Income/Expense Data
    builder
      .addCase(fetchIncomeExpenseData.pending, (state) => {
        state.incomeExpenseLoading = true;
        state.incomeExpenseError = null;
      })
      .addCase(fetchIncomeExpenseData.fulfilled, (state, action) => {
        state.incomeExpenseLoading = false;
        state.income = action.payload.income || state.income;
        state.expense = action.payload.expense || state.expense;
        state.balance = action.payload.balance || state.balance;
      })
      .addCase(fetchIncomeExpenseData.rejected, (state, action) => {
        state.incomeExpenseLoading = false;
        state.incomeExpenseError = action.payload;
      });
  },
});

export const { clearAccountsDashboard } = accountsDashboardSlice.actions;

export default accountsDashboardSlice.reducer;
