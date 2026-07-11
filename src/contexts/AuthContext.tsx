import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  skipProfile: () => void;
  needsProfile: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

const SESSION_KEY = "cardwiseoffer.demo.session";
const PROFILE_KEY = "cardwiseoffer.demo.profile";
const NEEDS_PROFILE_KEY = "cardwiseoffer.demo.needsProfile";

interface StoredSession {
  isLoggedIn: boolean;
  method: "email" | "phone";
  credential: string;
}

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function writeJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}
function clearKey(key: string) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);

  // Hydrate demo session from localStorage
  useEffect(() => {
    const session = readJSON<StoredSession>(SESSION_KEY);
    const profile = readJSON<UserProfile>(PROFILE_KEY);
    const needs = readJSON<boolean>(NEEDS_PROFILE_KEY);
    if (session?.isLoggedIn) {
      setIsLoggedIn(true);
      setUser(profile ?? {
        name: "",
        email: session.method === "email" ? session.credential : "",
        phone: session.method === "phone" ? session.credential : "",
      });
      setNeedsProfile(!!needs && !profile);
    }
  }, []);

  const login = (method: "email" | "phone", credential: string) => {
    const nextUser: UserProfile = {
      name: "",
      email: method === "email" ? credential : "",
      phone: method === "phone" ? credential : "",
    };
    setIsLoggedIn(true);
    setNeedsProfile(true);
    setUser(nextUser);
    writeJSON(SESSION_KEY, { isLoggedIn: true, method, credential } satisfies StoredSession);
    writeJSON(PROFILE_KEY, nextUser);
    writeJSON(NEEDS_PROFILE_KEY, true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setNeedsProfile(false);
    clearKey(SESSION_KEY);
    clearKey(PROFILE_KEY);
    clearKey(NEEDS_PROFILE_KEY);
  };

  const updateProfile = (profile: UserProfile) => {
    setUser(profile);
    setNeedsProfile(false);
    writeJSON(PROFILE_KEY, profile);
    writeJSON(NEEDS_PROFILE_KEY, false);
  };

  const skipProfile = () => {
    setNeedsProfile(false);
    writeJSON(NEEDS_PROFILE_KEY, false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, updateProfile, skipProfile, needsProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
