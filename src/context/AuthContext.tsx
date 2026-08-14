import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, LoginCredentials } from "../types/auth";
import { authService } from "../services/authService";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithQr: (qrToken: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("at_token"),
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Inisialisasi: Cek token di localStorage saat aplikasi pertama kali dibuka
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("at_token");
      if (savedToken) {
        try {
          const userData = await authService.getCurrentUser(savedToken);
          setUser(userData);
          setToken(savedToken);
        } catch (err) {
          localStorage.removeItem("at_token");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.login(credentials);
      localStorage.setItem("at_token", res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || "Gagal melakukan login");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithQr = async (qrToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.loginWithQrToken(qrToken);
      localStorage.setItem("at_token", res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || "QR Code tidak valid");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("at_token");
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Cek Permission dinamis dari data user (Bukan hardcoded UI)
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes("*")) return true; // Super admin
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        loginWithQr,
        logout,
        hasPermission,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
