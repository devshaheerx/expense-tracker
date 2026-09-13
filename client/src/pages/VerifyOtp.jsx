// pages/VerifyOtp.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { verifyOtp } from "../features/auth/authSlice";
import axiosInstance from "../api/axiosInstance";
import AuthLayout from "../components/AuthLayout";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useSelector((state) => state.auth);
  const email = location.state?.email;

  if (!email) {
    navigate("/signup");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(verifyOtp({ email, otp }));
    if (verifyOtp.fulfilled.match(result)) {
      toast.success("Email verified");
      navigate("/dashboard");
    } else {
      toast.error(result.payload || "Verification failed");
    }
  };

  const handleResend = async () => {
    try {
      await axiosInstance.post("/auth/resend-otp", { email });
      toast.success("A new code has been sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend code");
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={
        <>
          Code sent to <span className="font-semibold">{email}</span>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          maxLength={6}
          className="input-field text-center font-mono-amount text-xl tracking-[0.5em]"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? "Verifying…" : "Verify"}
        </button>
      </form>
      <button
        onClick={handleResend}
        className="mt-4 text-sm underline w-full text-center text-[rgb(var(--color-ink))]"
      >
        Resend code
      </button>
    </AuthLayout>
  );
};

export default VerifyOtp;
