import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, ArrowRight, Eye, EyeOff, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type AuthTab = "login" | "signup";
type AuthMethod = "email" | "phone";

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const { login, signup, verifyEmail, sendOtp, verifyOtp, loginWithGoogle, loginWithApple, needsEmailVerification, needsOtpVerification } = useAuth();
  const [tab, setTab] = useState<AuthTab>("login");
  const [method, setMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = () => {
    if (!email.includes("@") || password.length < 6) {
      setError("Enter a valid email and password (min 6 chars).");
      return;
    }
    login("email", email);
    onClose();
    resetForm();
  };

  const handleEmailSignup = () => {
    if (!name.trim()) { setError("Name is required."); return; }
    if (!email.includes("@")) { setError("Enter a valid email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    signup(email, password, name);
    setError("");
  };

  const handleVerifyEmail = () => {
    if (!verifyEmail(verificationCode)) {
      setError("Enter a valid verification code.");
    } else {
      onClose();
      resetForm();
    }
  };

  const handleSendOtp = () => {
    if (phone.length < 10) { setError("Enter a valid 10-digit phone number."); return; }
    sendOtp(phone);
    setError("");
  };

  const handleVerifyOtp = () => {
    if (!verifyOtp(otp)) {
      setError("Enter a valid OTP.");
    } else {
      onClose();
      resetForm();
    }
  };

  const handleGoogle = () => {
    loginWithGoogle();
    onClose();
    resetForm();
  };

  const handleApple = () => {
    loginWithApple();
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setEmail(""); setPassword(""); setPhone(""); setOtp(""); setName("");
    setVerificationCode(""); setError(""); setShowPassword(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => { onClose(); resetForm(); }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-md mx-4 bg-card rounded-2xl shadow-2xl border border-border p-8 max-h-[90vh] overflow-y-auto"
      >
        <button onClick={() => { onClose(); resetForm(); }} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-display font-bold text-foreground mb-1">Welcome</h2>
        <p className="text-sm text-muted-foreground mb-5">Sign in to unlock all card offers</p>

        {/* Email verification step */}
        {needsEmailVerification ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1">Verify your email</h3>
              <p className="text-sm text-muted-foreground">Enter the verification code sent to <strong>{email}</strong></p>
            </div>
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => { setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
              className="rounded-xl bg-secondary/50 border-0 h-12 text-center text-lg tracking-widest font-bold"
            />
            <p className="text-xs text-muted-foreground text-center">Enter any 4+ digit code to proceed</p>
            <Button onClick={handleVerifyEmail} className="w-full h-12 rounded-xl text-base font-semibold gap-2">
              Verify <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : needsOtpVerification ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1">Verify OTP</h3>
              <p className="text-sm text-muted-foreground">Enter the OTP sent to <strong>+91 {phone}</strong></p>
            </div>
            <Input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
              className="rounded-xl bg-secondary/50 border-0 h-12 text-center text-lg tracking-widest font-bold"
            />
            <p className="text-xs text-muted-foreground text-center">Enter any 4+ digit code to proceed</p>
            <Button onClick={handleVerifyOtp} className="w-full h-12 rounded-xl text-base font-semibold gap-2">
              Verify & Sign In <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            {/* Tab toggle: Login / Signup */}
            <div className="flex gap-1 mb-5 bg-secondary/40 p-1 rounded-xl">
              <button
                onClick={() => { setTab("login"); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
              <button
                onClick={() => { setTab("signup"); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Sign Up
              </button>
            </div>

            {/* Method tabs */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => { setMethod("email"); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${method === "email" ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary/60 text-muted-foreground hover:bg-secondary"}`}
              >
                <Mail className="w-4 h-4" /> Email
              </button>
              <button
                onClick={() => { setMethod("phone"); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${method === "phone" ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary/60 text-muted-foreground hover:bg-secondary"}`}
              >
                <Phone className="w-4 h-4" /> Phone
              </button>
            </div>

            <AnimatePresence mode="wait">
              {method === "email" ? (
                <motion.div key="email-form" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
                  {tab === "signup" && (
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Name</label>
                      <Input
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(""); }}
                        className="rounded-xl bg-secondary/50 border-0 h-12"
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      className="rounded-xl bg-secondary/50 border-0 h-12"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        className="rounded-xl bg-secondary/50 border-0 h-12 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    onClick={tab === "signup" ? handleEmailSignup : handleEmailLogin}
                    className="w-full h-12 rounded-xl text-base font-semibold gap-2"
                  >
                    {tab === "signup" ? "Create Account" : "Sign In"} <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="phone-form" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Phone Number</label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 bg-secondary/50 rounded-xl text-sm font-semibold text-muted-foreground">+91</span>
                      <Input
                        type="tel"
                        placeholder="10-digit number"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                        className="rounded-xl bg-secondary/50 border-0 h-12"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSendOtp} className="w-full h-12 rounded-xl text-base font-semibold gap-2">
                    Send OTP <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Social logins */}
            <div className="mt-5">
              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <span className="relative bg-card px-3 text-xs text-muted-foreground font-medium">or continue with</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-11 rounded-xl font-semibold gap-2 text-sm" onClick={handleGoogle}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google
                </Button>
                <Button variant="outline" className="flex-1 h-11 rounded-xl font-semibold gap-2 text-sm" onClick={handleApple}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  Apple
                </Button>
              </div>
            </div>
          </>
        )}

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-sm mt-3 text-center font-medium">
            {error}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default AuthModal;
