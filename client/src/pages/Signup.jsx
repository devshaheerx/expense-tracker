// pages/Signup.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { signupUser } from "../features/auth/authSlice";
import AuthLayout from "../components/AuthLayout";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(signupUser(formData));
    if (signupUser.fulfilled.match(result)) {
      toast.success("Check your email for the verification code");
      navigate("/verify-otp", { state: { email: formData.email } });
    } else {
      toast.error(result.payload || "Signup failed");
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/${provider}`;
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start keeping a ledger of your own."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Full name"
          value={formData.name}
          onChange={handleChange}
          required
          className="input-field"
        />
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
          minLength={8}
          className="input-field"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? "Creating account…" : "Sign up"}
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

export default Signup;
