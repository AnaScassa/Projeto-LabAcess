import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type PrivateRouteProps = {
  children: ReactNode;
};

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const token = localStorage.getItem("access");

  if (!token || localStorage.getItem("is_superuser") !== "true") {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("is_staff");
    localStorage.removeItem("is_superuser");
    return <Navigate to="/login" replace />;
  }

  return children;
}