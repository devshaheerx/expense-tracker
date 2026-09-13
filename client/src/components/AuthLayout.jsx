// components/AuthLayout.jsx
const AuthLayout = ({ title, subtitle, children, footer }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg))] px-3 sm:px-4 py-8">
      <div className="w-full max-w-sm sm:max-w-md ledger-card p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[rgb(var(--color-ink))]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm mt-1 opacity-70 text-[rgb(var(--color-ink))]">
              {subtitle}
            </p>
          )}
        </div>
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
