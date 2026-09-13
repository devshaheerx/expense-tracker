// pages/Login.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser } from "../features/auth/authSlice";
import AuthLayout from "../components/AuthLayout";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      toast.success("Welcome back");
      navigate("/dashboard");
    } else {
      if (
        result.payload &&
        typeof result.payload === "object" &&
        result.payload.email
      ) {
        navigate("/verify-otp", { state: { email: result.payload.email } });
      }
      toast.error(result.payload?.message || result.payload || "Login failed");
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/${provider}`;
  };

  return (
    <AuthLayout
      title="Log in"
      subtitle="Track where your money goes."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="font-semibold underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="input-field"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="input-field"
        />
        <p className="text-right text-sm">
          <Link
            to="/forgot-password"
            className="underline text-[rgb(var(--color-ink))]"
          >
            Forgot password?
          </Link>
        </p>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs opacity-60">
        <div className="ledger-divider flex-1" /> or{" "}
        <div className="ledger-divider flex-1" />
      </div>

      <div className="space-y-2">
        <button
          onClick={() => handleOAuth("google")}
          className="btn-outline w-full"
        >
          Continue with Google
        </button>
        <button
          onClick={() => handleOAuth("github")}
          className="btn-outline w-full"
        >
          Continue with GitHub
        </button>
      </div>
    </AuthLayout>
  );
};

export default Login;
