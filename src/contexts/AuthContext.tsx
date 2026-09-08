import { createContext, useContext, useState, type ReactNode } from "react";

export interface AuthUser {
  phone: string;
  maskedPhone: string;
  consentGiven: boolean;
  signedInAt: Date;
}

export type AuthStep = "idle" | "phone" | "otp" | "consent" | "success";

interface AuthContextValue {
  user: AuthUser | null;
  isSignedIn: boolean;
  authStep: AuthStep;
  pendingPhone: string;
  openSignIn: () => void;
  closeSignIn: () => void;
  submitPhone: (phone: string) => void;
  verifyOtp: (otp: string) => boolean;
  giveConsent: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const v = useContext(AuthContext);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
};

const makeUser = (phone: string): AuthUser => ({
  phone,
  maskedPhone: `+91 ****${phone.slice(-4)}`,
  consentGiven: true,
  signedInAt: new Date(),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authStep, setAuthStep] = useState<AuthStep>("idle");
  const [pendingPhone, setPendingPhone] = useState("");
  const [hasConsented, setHasConsented] = useState(false);

  const openSignIn = () => setAuthStep("phone");

  const closeSignIn = () => {
    setAuthStep("idle");
    setPendingPhone("");
  };

  const submitPhone = (phone: string) => {
    setPendingPhone(phone);
    setAuthStep("otp");
  };

  const verifyOtp = (otp: string): boolean => {
    if (otp.length !== 6) return false;
    if (!hasConsented) {
      setAuthStep("consent");
    } else {
      setUser(makeUser(pendingPhone));
      setAuthStep("success");
      setTimeout(closeSignIn, 1400);
    }
    return true;
  };

  const giveConsent = () => {
    setHasConsented(true);
    setUser(makeUser(pendingPhone));
    setAuthStep("success");
    setTimeout(closeSignIn, 1400);
  };

  const signOut = () => {
    setUser(null);
    setAuthStep("idle");
    setPendingPhone("");
  };

  return (
    <AuthContext.Provider value={{
      user, isSignedIn: user !== null,
      authStep, pendingPhone,
      openSignIn, closeSignIn, submitPhone, verifyOtp, giveConsent, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
