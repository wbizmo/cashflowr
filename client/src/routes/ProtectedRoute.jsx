import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070B14] text-white flex items-center justify-center">
        Checking session...
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;