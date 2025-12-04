interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Comentado temporariamente para permitir acesso sem login
  // const usuario = localStorage.getItem("usuario");

  // if (!usuario) {
  //   return <Navigate to="/login" replace />;
  // }

  return <>{children}</>;
}

