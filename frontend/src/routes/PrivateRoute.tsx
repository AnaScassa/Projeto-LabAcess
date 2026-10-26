import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type PrivateRouteProps = {
  children: ReactNode;
  requireAdmin?: boolean;
};

export default function PrivateRoute({ children, requireAdmin = false }: PrivateRouteProps) {
  const token = localStorage.getItem("access");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (
    requireAdmin &&
    (localStorage.getItem("is_staff") !== "true" ||
      localStorage.getItem("is_superuser") !== "true")
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}