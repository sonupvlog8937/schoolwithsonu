import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseUrl } from '../environment';

const initialState = {
  discounts: [],
  activeDiscounts: [],
  currentDiscount: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  },
  filters: {
    search: '',
    discountType: '',
    isActive: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
};

// Create fee discount
export const createFeeDiscount = createAsyncThunk(
  'feeDiscount/create',
  async (discountData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseUrl}/fee-discounts`, discountData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create fee discount'
      );
    }
  }
);

// Get all fee discounts with pagination and filters
export const getFeeDiscounts = createAsyncThunk(
  'feeDiscount/getAll',
  async ({ page = 1, limit = 10, search = '', discountType = '', isActive = '', sortBy = 'createdAt', sortOrder = 'desc' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        sortBy,
        sortOrder
      });

      if (search) params.append('search', search);
      if (discountType) params.append('discountType', discountType);
      if (isActive !== '') params.append('isActive', isActive);

      const response = await axios.get(`${baseUrl}/fee-discounts?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch fee discounts'
      );
    }
  }
);

// Get single fee discount by ID
export const getFeeDiscountById = createAsyncThunk(
  'feeDiscount/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/fee-discounts/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch fee discount'
      );
    }
  }
);

// Update fee discount
export const updateFeeDiscount = createAsyncThunk(
  'feeDiscount/update',
  async ({ id, discountData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${baseUrl}/fee-discounts/${id}`, discountData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update fee discount'
      );
    }
  }
);

// Delete fee discount
export const deleteFeeDiscount = createAsyncThunk(
  'feeDiscount/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${baseUrl}/fee-discounts/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete fee discount'
      );
    }
  }
);

// Get active discounts for dropdown
export const getActiveDiscounts = createAsyncThunk(
  'feeDiscount/getActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/fee-discounts/active/list`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch active discounts'
      );
    }
  }
);

// Calculate discount
export const calculateDiscount = createAsyncThunk(
  'feeDiscount/calculate',
  async ({ discountId, feeAmount, feeTypeId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseUrl}/fee-discounts/calculate`, {
        discountId,
        feeAmount,
        feeTypeId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to calculate discount'
      );
    }
  }
);

const feeDiscountSlice = createSlice({
  name: 'feeDiscount',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDiscount: (state) => {
      state.currentDiscount = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create fee discount
      .addCase(createFeeDiscount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFeeDiscount.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts.unshift(action.payload.data);
        state.pagination.totalRecords += 1;
      })
      .addCase(createFeeDiscount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get all fee discounts
      .addCase(getFeeDiscounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeeDiscounts.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getFeeDiscounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get fee discount by ID
      .addCase(getFeeDiscountById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeeDiscountById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDiscount = action.payload.data;
      })
      .addCase(getFeeDiscountById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update fee discount
      .addCase(updateFeeDiscount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFeeDiscount.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.discounts.findIndex(d => d._id === action.payload.data._id);
        if (index !== -1) {
          state.discounts[index] = action.payload.data;
        }
        state.currentDiscount = action.payload.data;
      })
      .addCase(updateFeeDiscount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete fee discount
      .addCase(deleteFeeDiscount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFeeDiscount.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts = state.discounts.filter(d => d._id !== action.payload.id);
        state.pagination.totalRecords -= 1;
      })
      .addCase(deleteFeeDiscount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get active discounts
      .addCase(getActiveDiscounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveDiscounts.fulfilled, (state, action) => {
        state.loading = false;
        state.activeDiscounts = action.payload.data;
      })
      .addCase(getActiveDiscounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Calculate discount
      .addCase(calculateDiscount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateDiscount.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(calculateDiscount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilters, resetFilters, clearError, clearCurrentDiscount } = feeDiscountSlice.actions;

export default feeDiscountSlice.reducer;
