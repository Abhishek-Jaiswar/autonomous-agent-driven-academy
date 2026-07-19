"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { store } from "./store";
import { useGetMeQuery } from "./api/auth/auth-api";

interface ReduxProviderProps {
  children: React.ReactNode;
}

/**
 * AuthWrapper: Global Application Authentication Guard
 * Uses RTK Query (useGetMeQuery) to fetch fresh user data via cookie credentials.
 */
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Fetch current user via cookie credentials
  const { data, isLoading, isError } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const user = data?.data?.user || (data?.data && "email" in data.data ? data.data : undefined) || data?.user;

  // Route protection rules
  const isProtectedRoute = pathname?.startsWith("/dashboard") || pathname?.startsWith("/interview");
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    if (!isLoading) {
      if (isProtectedRoute && (isError || !user)) {
        router.push("/login");
      } else if (isAuthRoute && user) {
        router.push("/dashboard");
      }
    }
  }, [isLoading, isError, user, isProtectedRoute, isAuthRoute, router]);

  // Show a clean full-screen loading state when authenticating a protected route
  if (isLoading && isProtectedRoute) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-mono text-sm">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-violet-500" />
        <div>Verifying session...</div>
      </div>
    );
  }

  return <>{children}</>;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <AuthWrapper>{children}</AuthWrapper>
    </Provider>
  );
}
