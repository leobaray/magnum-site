import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Define user type based on our schema
interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Auth status query
  const {
    data: authData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["/api/auth/status"],
    queryFn: async () => {
      const response = await apiRequest("/api/auth/status", {
        method: "GET",
      });
      return response;
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      return apiRequest("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
    },
    onSuccess: () => {
      // Refetch auth status after login
      refetch().then((result) => {
        if (result.data?.isAuthenticated) {
          // Redirect to admin panel after confirmation of authentication
          setLocation("/painel_magnum_administrativo_g2015443");
        }
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      // Refetch auth status and invalidate user-related queries
      queryClient.invalidateQueries();
      setLocation("/acessar_sistema_seguro_v87");
    },
  });

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Provide auth context
  const value = {
    user: authData?.user || null,
    isLoading,
    isAuthenticated: authData?.isAuthenticated || false,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}