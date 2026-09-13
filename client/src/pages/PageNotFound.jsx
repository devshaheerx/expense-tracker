import { Link } from 'react-router-dom';

const PageNotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg))] px-4">
      <div className="w-full max-w-sm border-2 border-[rgb(var(--color-border))] p-8 shadow-[6px_6px_0px_0px_rgb(var(--color-border))] text-center">
        <h1 className="text-6xl font-bold text-[rgb(var(--color-text))]">404</h1>
        <p className="mt-2 text-lg text-[rgb(var(--color-text))]">Page not found</p>
        <p className="mt-1 text-sm opacity-70 text-[rgb(var(--color-text))]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block w-full bg-[rgb(var(--color-accent))] text-white font-semibold py-2 border-2 border-[rgb(var(--color-border))]"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PageNotFound;