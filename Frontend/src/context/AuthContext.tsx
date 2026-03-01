import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "@/services/api";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string, purpose: "registration" | "login" | "password-reset") => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const saveSession = (userData: any, jwtToken: string) => {
    // Normalize backend user shape (backend sends `id`, frontend expects `_id`)
    const normalized: UserData = {
      _id: userData.id || userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role || "user",
    };
    setUser(normalized);
    setToken(jwtToken);
    localStorage.setItem("user", JSON.stringify(normalized));
    localStorage.setItem("token", jwtToken);
  };

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    saveSession(data.user, data.token);
  };

  const verifyOtp = async (email: string, otp: string) => {
    const data = await authApi.verifyRegistration(email, otp);
    saveSession(data.user, data.token);
  };

  const resendOtp = async (email: string, purpose: "registration" | "login" | "password-reset") => {
    await authApi.resendOtp(email, purpose);
  };

  const forgotPassword = async (email: string) => {
    await authApi.forgotPassword(email);
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    await authApi.resetPassword(email, otp, newPassword);
  };

  const updateProfile = async (name: string) => {
    const data = await authApi.updateProfile(name);
    if (user && data.user) {
      const updated = { ...user, name: data.user.name };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await authApi.changePassword(currentPassword, newPassword);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin: user?.role === "admin",
        loading,
        login,
        logout,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
