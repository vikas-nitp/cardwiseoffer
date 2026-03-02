import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import type { AuthUser } from "@/types/api";

interface AuthState {
  isLoggedIn: boolean;
  user: AuthUser | null;
  needsProfile: boolean;
  needsEmailVerification: boolean;
  needsOtpVerification: boolean;
  pendingPhone: string | null;
  login: (method: "email" | "phone" | "google" | "apple", credential: string) => void;
  signup: (email: string, password: string, name: string) => void;
  verifyEmail: (code: string) => boolean;
  sendOtp: (phone: string) => void;
  verifyOtp: (otp: string) => boolean;
  loginWithGoogle: () => void;
  loginWithApple: () => void;
  logout: () => void;
  updateProfile: (profile: Partial<AuthUser>) => void;
  skipProfile: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [needsOtpVerification, setNeedsOtpVerification] = useState(false);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  const makeUid = () => `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const signup = useCallback((email: string, _password: string, name: string) => {
    setUser({
      uid: makeUid(), name, email, phone: "",
      emailVerified: false, provider: "email",
    });
    setNeedsEmailVerification(true);
  }, []);

  const verifyEmail = useCallback((code: string): boolean => {
    if (code.length >= 4) {
      setNeedsEmailVerification(false);
      setIsLoggedIn(true);
      setNeedsProfile(true);
      if (user) setUser({ ...user, emailVerified: true });
      return true;
    }
    return false;
  }, [user]);

  const login = useCallback((method: "email" | "phone" | "google" | "apple", credential: string) => {
    if (method === "email") {
      setUser({
        uid: makeUid(), name: "", email: credential, phone: "",
        emailVerified: true, provider: "email",
      });
      setIsLoggedIn(true);
      setNeedsProfile(true);
    }
  }, []);

  const sendOtp = useCallback((phone: string) => {
    setPendingPhone(phone);
    setNeedsOtpVerification(true);
  }, []);

  const verifyOtp = useCallback((otp: string): boolean => {
    if (otp.length >= 4 && pendingPhone) {
      setUser({
        uid: makeUid(), name: "", email: "", phone: pendingPhone,
        emailVerified: false, provider: "phone",
      });
      setIsLoggedIn(true);
      setNeedsProfile(true);
      setNeedsOtpVerification(false);
      setPendingPhone(null);
      return true;
    }
    return false;
  }, [pendingPhone]);

  const loginWithGoogle = useCallback(() => {
    setUser({
      uid: makeUid(), name: "Google User", email: "user@gmail.com", phone: "",
      emailVerified: true, provider: "google",
    });
    setIsLoggedIn(true);
    setNeedsProfile(true);
  }, []);

  const loginWithApple = useCallback(() => {
    setUser({
      uid: makeUid(), name: "Apple User", email: "user@icloud.com", phone: "",
      emailVerified: true, provider: "apple",
    });
    setIsLoggedIn(true);
    setNeedsProfile(true);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    setNeedsProfile(false);
    setNeedsEmailVerification(false);
    setNeedsOtpVerification(false);
    setPendingPhone(null);
  }, []);

  const updateProfile = useCallback((profile: Partial<AuthUser>) => {
    setUser(prev => prev ? { ...prev, ...profile } : null);
    setNeedsProfile(false);
  }, []);

  const skipProfile = useCallback(() => {
    setNeedsProfile(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      isLoggedIn, user, needsProfile, needsEmailVerification, needsOtpVerification, pendingPhone,
      login, signup, verifyEmail, sendOtp, verifyOtp, loginWithGoogle, loginWithApple,
      logout, updateProfile, skipProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
