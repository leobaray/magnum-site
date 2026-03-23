import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  adminOnly = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        setLocation("/login");
      } 
      // If adminOnly and user is not admin, redirect to home
      else if (adminOnly && user && !user.isAdmin) {
        setLocation("/");
      }
    }
  }, [isLoading, isAuthenticated, adminOnly, user, setLocation]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated (and admin if adminOnly), show the children
  if (isAuthenticated && (!adminOnly || (user && user.isAdmin))) {
    return <>{children}</>;
  }

  // This will only show for a split second before the redirect happens
  return null;
}