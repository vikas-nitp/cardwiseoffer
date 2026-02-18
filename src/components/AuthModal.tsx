import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const { login } = useAuth();
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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

  const handleSendOtp = () => {
    if (phone.length < 10) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    setOtpSent(true);
    setError("");
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) {
      setError("Enter a valid OTP.");
      return;
    }
    login("phone", phone);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setEmail(""); setPassword(""); setPhone(""); setOtp("");
    setOtpSent(false); setError(""); setShowPassword(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => { onClose(); resetForm(); }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-md mx-4 glass-card rounded-2xl card-shadow-lg p-8"
      >
        <button onClick={() => { onClose(); resetForm(); }} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-display font-bold text-foreground mb-1">Welcome</h2>
        <p className="text-sm text-muted-foreground mb-6">Sign in to save your preferences</p>

        {/* Method tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setMethod("email"); setError(""); setOtpSent(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${method === "email" ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary/60 text-muted-foreground hover:bg-secondary"}`}
          >
            <Mail className="w-4 h-4" /> Email
          </button>
          <button
            onClick={() => { setMethod("phone"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${method === "phone" ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary/60 text-muted-foreground hover:bg-secondary"}`}
          >
            <Phone className="w-4 h-4" /> Phone OTP
          </button>
        </div>

        <AnimatePresence mode="wait">
          {method === "email" ? (
            <motion.div key="email-form" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
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
              <Button onClick={handleEmailLogin} className="w-full h-12 rounded-xl text-base font-semibold gap-2">
                Sign In <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div key="phone-form" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
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
                    disabled={otpSent}
                  />
                </div>
              </div>
              {otpSent ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Enter OTP</label>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                      className="rounded-xl bg-secondary/50 border-0 h-12 text-center text-lg tracking-widest font-bold"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">Demo: enter any 4+ digit code</p>
                  </div>
                  <Button onClick={handleVerifyOtp} className="w-full h-12 rounded-xl text-base font-semibold gap-2">
                    Verify & Sign In <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button onClick={handleSendOtp} className="w-full h-12 rounded-xl text-base font-semibold gap-2">
                  Send OTP <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-sm mt-3 text-center font-medium">
            {error}
          </motion.p>
        )}

        <p className="text-xs text-muted-foreground text-center mt-6">
          Mock login — no real data is stored.
        </p>
      </motion.div>
    </div>
  );
};

export default AuthModal;
