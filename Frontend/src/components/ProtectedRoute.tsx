import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ReactNode } from "react";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!user || !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};
