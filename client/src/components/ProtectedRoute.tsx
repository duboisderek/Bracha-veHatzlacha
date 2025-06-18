import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireRootAdmin?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  requireRootAdmin = false,
  redirectTo = "/login"
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      navigate(redirectTo);
      return;
    }

    if (requireRootAdmin && (!isAuthenticated || !(user as any)?.isRootAdmin)) {
      navigate("/admin-login");
      return;
    }

    if (requireAdmin && (!isAuthenticated || !(user as any)?.isAdmin)) {
      navigate("/admin-login");
      return;
    }
  }, [isAuthenticated, isLoading, user, requireAuth, requireAdmin, requireRootAdmin, redirectTo, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireRootAdmin && (!isAuthenticated || !(user as any)?.isRootAdmin)) {
    return null;
  }

  if (requireAdmin && (!isAuthenticated || !(user as any)?.isAdmin)) {
    return null;
  }

  return <>{children}</>;
}