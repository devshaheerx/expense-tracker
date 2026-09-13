import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

// Wraps any page that requires login. While fetchCurrentUser is still resolving
// (isLoading), we show nothing/a loader rather than immediately redirecting —
// otherwise a logged-in user would flash to /login for a split second on every refresh.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[rgb(var(--color-text))]">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;