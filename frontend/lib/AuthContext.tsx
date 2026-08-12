"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "./api";
import { clearTokens, getAccessToken, setTokens } from "./auth";
import type { User } from "./types";

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = "finance_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    const storedUser = typeof window !== "undefined" ? localStorage.getItem(USER_STORAGE_KEY) : null;
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser) as User);
      } catch {
        clearTokens();
      }
    }
    setLoading(false);
  }, []);

  const persistSession = useCallback((data: AuthResponse) => {
    setTokens(data.accessToken, data.refreshToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<AuthResponse>("/auth/login", { email, password }, true);
      persistSession(res.data);
    },
    [persistSession]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.post<AuthResponse>("/auth/register", { name, email, password }, true);
      persistSession(res.data);
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("finance_refresh_token") : null;
    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken }, true);
      }
    } catch (error) {
      if (!(error instanceof ApiError)) {
        console.error(error);
      }
    } finally {
      clearTokens();
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
