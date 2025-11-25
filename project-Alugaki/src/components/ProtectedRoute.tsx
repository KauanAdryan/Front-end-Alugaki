import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const usuario = localStorage.getItem("usuario");

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

