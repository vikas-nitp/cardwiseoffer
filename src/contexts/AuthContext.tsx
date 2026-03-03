import { createContext, useContext, useState, ReactNode } from "react";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: UserProfile | null;
  login: (method: "email" | "phone", credential: string) => void;
  logout: () => void;
  updateProfile: (profile: UserProfile) => void;
  needsProfile: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);

  const login = (method: "email" | "phone", credential: string) => {
    setIsLoggedIn(true);
    setNeedsProfile(true);
    setUser({
      name: "",
      email: method === "email" ? credential : "",
      phone: method === "phone" ? credential : "",
    });
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setNeedsProfile(false);
  };

  const updateProfile = (profile: UserProfile) => {
    setUser(profile);
    setNeedsProfile(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, updateProfile, needsProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
