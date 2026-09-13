// pages/SettingsPage.jsx
import { useDispatch, useSelector } from "react-redux";
import { LogOut, ShieldOff, Sun, Moon } from "lucide-react";
import { logoutUser, logoutAllUser } from "../features/auth/authSlice";
import { useTheme } from "../context/ThemeContext";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="animate-rise max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-[rgb(var(--color-ink))] mb-1">
        Settings
      </h1>
      <p className="text-sm opacity-60 mb-6 text-[rgb(var(--color-ink))]">
        Your account details, appearance, and session controls.
      </p>

      <div className="ledger-card p-6 mb-6">
        <h2 className="font-display text-lg font-semibold text-[rgb(var(--color-ink))] mb-4">
          Account
        </h2>
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 shrink-0 rounded-full flex items-center justify-center font-semibold text-lg"
            style={{
              backgroundColor: "rgb(var(--color-accent) / 0.2)",
              color: "rgb(var(--color-accent))",
            }}
          >
            {getInitials(user?.name)}
          </div>
          <div>
            <p className="font-medium text-[rgb(var(--color-ink))]">
              {user?.name}
            </p>
            <p className="text-sm opacity-60 text-[rgb(var(--color-ink))]">
              {user?.email}
            </p>
            <p className="text-xs opacity-50 mt-1 text-[rgb(var(--color-ink))] capitalize">
              Signed in with {user?.authProvider}
            </p>
          </div>
        </div>
      </div>

      <div className="ledger-card p-6 mb-6">
        <h2 className="font-display text-lg font-semibold text-[rgb(var(--color-ink))] mb-4">
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[rgb(var(--color-ink))]">
              Theme
            </p>
            <p className="text-xs opacity-60 text-[rgb(var(--color-ink))]">
              {theme === "dark" ? "Dark mode is on" : "Light mode is on"}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="btn-outline flex items-center gap-2 text-sm"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            Switch to {theme === "dark" ? "light" : "dark"}
          </button>
        </div>
      </div>

      <div className="ledger-card p-6">
        <h2 className="font-display text-lg font-semibold text-[rgb(var(--color-ink))] mb-1">
          Sessions
        </h2>
        <p className="text-xs opacity-60 mb-4 text-[rgb(var(--color-ink))]">
          Log out of just this device, or end every active session across all
          your devices at once.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => dispatch(logoutUser())}
            className="btn-outline flex-1 flex items-center justify-center gap-2 text-sm"
          >
            <LogOut size={16} /> Log out
          </button>
          <button
            onClick={() => dispatch(logoutAllUser())}
            className="btn-outline flex-1 flex items-center justify-center gap-2 text-sm"
            style={{
              borderColor: "rgb(var(--color-expense))",
              color: "rgb(var(--color-expense))",
            }}
          >
            <ShieldOff size={16} /> Log out of all devices
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
