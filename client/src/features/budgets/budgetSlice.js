// features/budgets/budgetSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchBudgets = createAsyncThunk(
  "budgets/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/budgets");
      return res.data.budgets;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load budgets",
      );
    }
  },
);

export const addBudget = createAsyncThunk(
  "budgets/add",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/budgets", data);
      return res.data.budget;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add budget",
      );
    }
  },
);

export const deleteBudget = createAsyncThunk(
  "budgets/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/budgets/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete budget",
      );
    }
  },
);

const budgetSlice = createSlice({
  name: "budgets",
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addBudget.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b._id !== action.payload);
      });
  },
});

export default budgetSlice.reducer;
