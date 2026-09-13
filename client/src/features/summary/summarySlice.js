// features/summary/summarySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchCategoryBreakdown = createAsyncThunk(
  'summary/fetchCategoryBreakdown',
  async (params, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/summary/category', { params });
      return res.data.breakdown;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load breakdown');
    }
  }
);

export const fetchMonthlyTrend = createAsyncThunk(
  'summary/fetchMonthlyTrend',
  async (params, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/summary/trend', { params });
      return res.data.trend;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load trend');
    }
  }
);

export const fetchOverview = createAsyncThunk(
  'summary/fetchOverview',
  async (params, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/summary/overview', { params });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load overview');
    }
  }
);

export const fetchCategoryTrend = createAsyncThunk(
  'summary/fetchCategoryTrend',
  async (params, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/summary/category-trend', { params });
      return res.data.trend;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load category trend');
    }
  }
);

export const fetchBudgetVsActual = createAsyncThunk(
  'summary/fetchBudgetVsActual',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/summary/budget-vs-actual');
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load budget comparison');
    }
  }
);

const summarySlice = createSlice({
  name: 'summary',
  initialState: {
    breakdown: [],
    trend: [],
    categoryTrend: [],
    budgetVsActual: [],
    overview: { income: 0, expense: 0, balance: 0 },
    isLoading: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoryBreakdown.fulfilled, (state, action) => {
        state.breakdown = action.payload;
      })
      .addCase(fetchMonthlyTrend.fulfilled, (state, action) => {
        state.trend = action.payload;
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.overview = action.payload;
      })
      .addCase(fetchCategoryTrend.fulfilled, (state, action) => {
        state.categoryTrend = action.payload;
      })
      .addCase(fetchBudgetVsActual.fulfilled, (state, action) => {
        state.budgetVsActual = action.payload;
      });
  },
});

export default summarySlice.reducer;