// components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Target,
  Settings,
  Menu,
  ChevronsLeft,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/transactions", label: "Transactions", icon: Receipt },
  { to: "/dashboard/budgets", label: "Budgets", icon: Target },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Sidebar = ({
  isOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapse,
  isAnimating,
}) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        style={
          isAnimating
            ? { backdropFilter: "none", WebkitBackdropFilter: "none" }
            : undefined
        }
        className={`fixed md:sticky md:top-4 md:self-start z-40 top-0 left-0 h-screen md:h-[calc(100vh-2rem)] md:ml-4 ledger-card isolate flex flex-col p-4 transition-transform duration-300 ease-out md:transition-[width] md:duration-300 md:ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64 ${collapsed ? "md:w-20" : "md:w-64"}`}
      >
        <div className="flex items-center justify-between mb-8 overflow-hidden">
          <h2
            className={`font-display text-xl font-semibold text-[rgb(var(--color-ink))] whitespace-nowrap transition-opacity duration-200 ${
              collapsed ? "md:opacity-0 md:w-0" : "opacity-100"
            }`}
          >
            Ledger
          </h2>

          <button
            onClick={onCloseMobile}
            className="md:hidden text-[rgb(var(--color-ink))] opacity-70 hover:opacity-100 shrink-0"
          >
            <X size={20} />
          </button>

          <button
            onClick={onToggleCollapse}
            type="button"
            className="hidden md:block text-[rgb(var(--color-ink))] opacity-70 hover:opacity-100 shrink-0 cursor-pointer"
          >
            {collapsed ? <Menu size={20} /> : <ChevronsLeft size={20} />}
          </button>
        </div>

        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onCloseMobile}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `sidebar-link w-full overflow-hidden ${isActive ? "active" : ""} ${collapsed ? "md:justify-center" : ""}`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span
                className={`whitespace-nowrap transition-opacity duration-200 ${collapsed ? "md:opacity-0 md:w-0" : "opacity-100"}`}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div
          className={`ledger-divider pt-4 flex items-center gap-3 overflow-hidden ${collapsed ? "md:justify-center" : ""}`}
        >
          <div
            className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-semibold text-sm"
            style={{
              backgroundColor: "rgb(var(--color-accent) / 0.2)",
              color: "rgb(var(--color-accent))",
            }}
          >
            {getInitials(user?.name)}
          </div>
          <div
            className={`min-w-0 whitespace-nowrap transition-opacity duration-200 ${collapsed ? "md:opacity-0 md:w-0" : "opacity-100"}`}
          >
            <p className="font-medium text-sm text-[rgb(var(--color-ink))] truncate">
              {user?.name}
            </p>
            <p className="text-xs opacity-60 text-[rgb(var(--color-ink))] truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
