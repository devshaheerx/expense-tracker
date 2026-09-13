// App.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { fetchCurrentUser } from "./features/auth/authSlice";
import { useTheme } from "./context/ThemeContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Overview from "./pages/Overview";
import TransactionsPage from "./pages/TransactionsPage";
import BudgetsPage from "./pages/BudgetsPage";
import PageNotFound from "./pages/PageNotFound";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import SettingsPage from "./pages/SettingsPage";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg))]">
        <p className="text-[rgb(var(--color-ink))]">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgb(var(--color-solid))",
            color: "rgb(var(--color-ink))",
            border:
              theme === "dark"
                ? "1px solid rgba(255,255,255,0.14)"
                : "1px solid rgb(var(--color-border))",
            borderRadius: "14px",
            backdropFilter: theme === "dark" ? "blur(20px)" : "none",
            boxShadow:
              theme === "dark"
                ? "0 8px 32px rgba(0,0,0,0.35)"
                : "0 4px 16px rgba(15,23,42,0.1)",
            fontFamily: "Inter, sans-serif",
          },
          success: {
            iconTheme: {
              primary: "rgb(var(--color-income))",
              secondary: "rgb(var(--color-surface))",
            },
          },
          error: {
            iconTheme: {
              primary: "rgb(var(--color-expense))",
              secondary: "rgb(var(--color-surface))",
            },
          },
        }}
      />
      <Routes>
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;
