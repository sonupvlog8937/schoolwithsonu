import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

// Get Inventory Dashboard
export const getInventoryDashboard = createAsyncThunk(
  'inventoryDashboard/getDashboard',
  async (schoolId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      };
      
      const response = await axios.get(
        `${API_URL}/api/inventory-dashboard/dashboard/${schoolId}`,
        config
      );

      return response?.data?.data ?? response?.data ?? {
        customerBalance: 0,
        stockValue: 0,
        supplierBalance: 0,
        activeItems: 0,
        sellAmount: {
          today: 0,
          lastWeek: 0,
          currentMonth: 0,
          last6Months: 0,
          currentSession: 0,
        },
        receivedAmount: {
          today: 0,
          lastWeek: 0,
          currentMonth: 0,
          last6Months: 0,
          currentSession: 0,
        },
        purchaseAmount: {
          today: 0,
          lastWeek: 0,
          currentMonth: 0,
          last6Months: 0,
          currentSession: 0,
        },
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch inventory dashboard'
      );
    }
  }
);

// Get Low Stock Items
export const getLowStockItems = createAsyncThunk(
  'inventoryDashboard/getLowStock',
  async ({ schoolId, limit = 10 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { limit }
      };
      
      const response = await axios.get(
        `${API_URL}/api/inventory-dashboard/low-stock/${schoolId}`,
        config
      );
      
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch low stock items'
      );
    }
  }
);

// Get Recent Transactions
export const getRecentTransactions = createAsyncThunk(
  'inventoryDashboard/getTransactions',
  async ({ schoolId, type = 'all', limit = 10 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { type, limit }
      };
      
      const response = await axios.get(
        `${API_URL}/api/inventory-dashboard/recent-transactions/${schoolId}`,
        config
      );
      
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch recent transactions'
      );
    }
  }
);

const inventoryDashboardSlice = createSlice({
  name: 'inventoryDashboard',
  initialState: {
    dashboard: {
      customerBalance: 0,
      stockValue: 0,
      supplierBalance: 0,
      activeItems: 0,
      sellAmount: {
        today: 0,
        lastWeek: 0,
        currentMonth: 0,
        last6Months: 0,
        currentSession: 0
      },
      receivedAmount: {
        today: 0,
        lastWeek: 0,
        currentMonth: 0,
        last6Months: 0,
        currentSession: 0
      },
      purchaseAmount: {
        today: 0,
        lastWeek: 0,
        currentMonth: 0,
        last6Months: 0,
        currentSession: 0
      }
    },
    lowStockItems: [],
    recentTransactions: [],
    loading: false,
    lowStockLoading: false,
    transactionsLoading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Dashboard
      .addCase(getInventoryDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInventoryDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(getInventoryDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Low Stock Items
      .addCase(getLowStockItems.pending, (state) => {
        state.lowStockLoading = true;
        state.error = null;
      })
      .addCase(getLowStockItems.fulfilled, (state, action) => {
        state.lowStockLoading = false;
        state.lowStockItems = action.payload;
      })
      .addCase(getLowStockItems.rejected, (state, action) => {
        state.lowStockLoading = false;
        state.error = action.payload;
      })
      
      // Get Recent Transactions
      .addCase(getRecentTransactions.pending, (state) => {
        state.transactionsLoading = true;
        state.error = null;
      })
      .addCase(getRecentTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false;
        state.recentTransactions = action.payload;
      })
      .addCase(getRecentTransactions.rejected, (state, action) => {
        state.transactionsLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = inventoryDashboardSlice.actions;
export default inventoryDashboardSlice.reducer;
