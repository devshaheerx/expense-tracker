// features/transactions/transactionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchTransactions = createAsyncThunk(
  "transactions/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/transactions", { params });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load transactions",
      );
    }
  },
);

export const addTransaction = createAsyncThunk(
  "transactions/add",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/transactions", data);
      return res.data; // { message, transaction, budgetAlert }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add transaction",
      );
    }
  },
);

export const updateTransaction = createAsyncThunk(
  "transactions/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/transactions/${id}`, data);
      return res.data.transaction;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update transaction",
      );
    }
  },
);

export const deleteTransaction = createAsyncThunk(
  "transactions/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/transactions/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete transaction",
      );
    }
  },
);

const transactionSlice = createSlice({
  name: "transactions",
  initialState: {
    items: [],
    pagination: { total: 0, page: 1, pages: 1 },
    isLoading: false,
    error: null,
    lastBudgetAlert: null, // most recent alert, shown as a toast/banner after adding a transaction
  },
  reducers: {
    clearBudgetAlert: (state) => {
      state.lastBudgetAlert = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.items = action.payload.transactions;
        state.pagination = action.payload.pagination;
        state.isLoading = false;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.items.unshift(action.payload.transaction); // newest first, matches backend sort
        state.lastBudgetAlert = action.payload.budgetAlert;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (t) => t._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
      });
  },
});

export const { clearBudgetAlert } = transactionSlice.actions;
export default transactionSlice.reducer;
