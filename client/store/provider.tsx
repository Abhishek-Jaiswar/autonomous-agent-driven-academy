"use client";

import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store";
import { useGetMeQuery } from "./api/auth/auth-api";
import { setCredentials, logout } from "./slices/authSlice";

interface ReduxProviderProps {
  children: React.ReactNode;
}

function AuthPersist({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  
  // Call /auth/me on application load
  const { data, error, isLoading, isSuccess } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    const userObj = data?.data?.user || data?.user;
    if (isSuccess && userObj) {
      dispatch(setCredentials({ user: userObj }));
    } else if (error) {
      dispatch(logout());
    }
  }, [data, error, isSuccess, dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground font-mono text-sm">
        <div className="animate-pulse">Loading AstraLearn...</div>
      </div>
    );
  }

  return <>{children}</>;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <AuthPersist>{children}</AuthPersist>
    </Provider>
  );
}
