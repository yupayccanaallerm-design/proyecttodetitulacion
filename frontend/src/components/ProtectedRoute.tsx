import { Navigate } from "react-router-dom";
import { isAdminSessionActive } from "../api";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isActive = isAdminSessionActive();

  if (!isActive) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
