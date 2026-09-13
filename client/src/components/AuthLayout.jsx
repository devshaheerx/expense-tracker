// components/AuthLayout.jsx
const AuthLayout = ({ title, subtitle, children, footer }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg))] px-4">
      <div className="w-full max-w-sm ledger-card p-8">
        <h1 className="font-display text-3xl font-semibold mb-1 text-[rgb(var(--color-ink))]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mb-6 opacity-70 text-[rgb(var(--color-ink))]">
            {subtitle}
          </p>
        )}
        {children}
        {footer && (
          <div className="mt-6 text-sm text-center text-[rgb(var(--color-ink))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthLayout;
