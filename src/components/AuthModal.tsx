import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

// ── Validation helpers ─────────────────────────────────────────────
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/; // Indian mobile: starts with 6-9, 10 digits
const PASSWORD_MIN_LENGTH = 6;
const OTP_LENGTH = 6;

const validateEmail = (email: string): string | null => {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required";
  if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address";
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required";
  if (password.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  return null;
};

const validatePhone = (phone: string): string | null => {
  if (!phone) return "Phone number is required";
  if (!PHONE_PATTERN.test(phone)) return "Enter a valid 10-digit mobile number";
  return null;
};

const validateOtp = (otp: string): string | null => {
  if (!otp) return "OTP is required";
  if (otp.length < OTP_LENGTH) return `Enter ${OTP_LENGTH}-digit OTP`;
  return null;
};

// ────────────────────────────────────────────────────────────────────

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const { login } = useAuth();
  const [method, setMethod] = useState<"email" | "phone">("email");
  
  // Email login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Phone login fields
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    phone?: string;
    otp?: string;
  }>({});
  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
    phone?: boolean;
    otp?: boolean;
  }>({});

  // Real-time validation
  const emailValidation = useMemo(() => ({
    email: validateEmail(email),
    password: validatePassword(password),
  }), [email, password]);

  const phoneValidation = useMemo(() => ({
    phone: validatePhone(phone),
    otp: validateOtp(otp),
  }), [phone, otp]);

  const handleBlur = (field: keyof typeof errors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleEmailLogin = () => {
    setTouched({ email: true, password: true });
    setErrors({
      email: emailValidation.email ?? undefined,
      password: emailValidation.password ?? undefined,
    });

    if (emailValidation.email || emailValidation.password) return;

    login("email", email.trim().toLowerCase());
    onClose();
    resetForm();
  };

  const handleSendOtp = () => {
    setTouched({ phone: true });
    setErrors({ phone: phoneValidation.phone ?? undefined });

    if (phoneValidation.phone) return;

    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    setTouched({ otp: true });
    setErrors({ otp: phoneValidation.otp ?? undefined });

    if (phoneValidation.otp) return;

    login("phone", phone);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setPhone("");
    setOtp("");
    setOtpSent(false);
    setErrors({});
    setTouched({});
    setShowPassword(false);
  };

  const switchMethod = (newMethod: "email" | "phone") => {
    setMethod(newMethod);
    setErrors({});
    setTouched({});
    setOtpSent(false);
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
            onClick={() => switchMethod("email")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${method === "email" ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary/60 text-muted-foreground hover:bg-secondary"}`}
          >
            <Mail className="w-4 h-4" /> Email
          </button>
          <button
            onClick={() => switchMethod("phone")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${method === "phone" ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary/60 text-muted-foreground hover:bg-secondary"}`}
          >
            <Phone className="w-4 h-4" /> Phone OTP
          </button>
        </div>

        <AnimatePresence mode="wait">
          {method === "email" ? (
            <motion.div key="email-form" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  onBlur={() => handleBlur("email")}
                  className={`rounded-xl bg-secondary/50 border-0 h-12 ${
                    touched.email && errors.email ? "ring-2 ring-destructive" : ""
                  }`}
                />
                {touched.email && errors.email && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    onBlur={() => handleBlur("password")}
                    className={`rounded-xl bg-secondary/50 border-0 h-12 pr-10 ${
                      touched.password && errors.password ? "ring-2 ring-destructive" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.password}
                  </p>
                )}
              </div>

              <Button 
                onClick={handleEmailLogin} 
                disabled={!!(emailValidation.email || emailValidation.password)}
                className="w-full h-12 rounded-xl text-base font-semibold gap-2"
              >
                Sign In <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div key="phone-form" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              {/* Phone Field */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-secondary/50 rounded-xl text-sm font-semibold text-muted-foreground h-12">+91</span>
                  <Input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setPhone(digits);
                      if (touched.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                    }}
                    onBlur={() => handleBlur("phone")}
                    className={`rounded-xl bg-secondary/50 border-0 h-12 ${
                      touched.phone && errors.phone ? "ring-2 ring-destructive" : ""
                    }`}
                    disabled={otpSent}
                    inputMode="numeric"
                  />
                </div>
                {touched.phone && errors.phone && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>

              {otpSent ? (
                <>
                  {/* OTP Field */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Enter OTP <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setOtp(digits);
                        if (touched.otp) setErrors(prev => ({ ...prev, otp: undefined }));
                      }}
                      onBlur={() => handleBlur("otp")}
                      className={`rounded-xl bg-secondary/50 border-0 h-12 text-center text-lg tracking-widest font-bold ${
                        touched.otp && errors.otp ? "ring-2 ring-destructive" : ""
                      }`}
                      inputMode="numeric"
                    />
                    {touched.otp && errors.otp && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.otp}
                      </p>
                    )}
                  </div>
                  <Button 
                    onClick={handleVerifyOtp} 
                    disabled={!!phoneValidation.otp}
                    className="w-full h-12 rounded-xl text-base font-semibold gap-2"
                  >
                    Verify & Sign In <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleSendOtp} 
                  disabled={!!phoneValidation.phone}
                  className="w-full h-12 rounded-xl text-base font-semibold gap-2"
                >
                  Send OTP <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};

export default AuthModal;
