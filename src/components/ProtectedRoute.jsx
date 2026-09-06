import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Alert from "./Alert";

// Wraps routes that require login. If there's no currentUser,
// bounce to /login instead of rendering the page.
// "allowedRoles" is optional — pass it to also restrict by role
// (e.g. only Admin can reach Users, matching your requirements doc).
function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <p className="p-4">Loading...</p>;

  if (!currentUser) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="p-4">
        <Alert type="warning">You don't have permission to view this page.</Alert>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
