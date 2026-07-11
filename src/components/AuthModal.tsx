import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, ArrowRight, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;

const validateEmail = (v: string) => {
  const t = v.trim();
  if (!t) return "Email is required";
  if (!EMAIL_PATTERN.test(t)) return "Enter a valid email address";
  return null;
};
const validatePhone = (v: string) => {
  if (!v) return "Phone number is required";
  if (!PHONE_PATTERN.test(v)) return "Enter a valid 10-digit Indian mobile number";
  return null;
};

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Demo sign-in modal.
 * - No password.
 * - No OTP delivery. This is UI demo only; no real account is created.
 * - Session persists to localStorage via AuthContext.
 */
const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const { login } = useAuth();
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  const validation = useMemo(() => ({
    email: validateEmail(email),
    phone: validatePhone(phone),
  }), [email, phone]);

  const reset = () => {
    setEmail(""); setPhone(""); setErrors({});
  };

  const handleClose = () => { onClose(); reset(); };

  const handleSubmit = () => {
    if (method === "email") {
      if (validation.email) { setErrors({ email: validation.email }); return; }
      login("email", email.trim().toLowerCase());
    } else {
      if (validation.phone) { setErrors({ phone: validation.phone }); return; }
      login("phone", phone);
    }
    handleClose();
  };

  const switchMethod = (m: "email" | "phone") => { setMethod(m); setErrors({}); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Demo sign-in">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-md mx-4 glass-card rounded-2xl card-shadow-lg p-8"
      >
        <button onClick={handleClose} aria-label="Close" className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-display font-bold text-foreground mb-1">Sign in</h2>
        <p className="text-sm text-muted-foreground mb-4">Save your preferences across sessions.</p>

        <div className="flex items-start gap-2 mb-6 text-[11px] text-amber-800 bg-amber-50/70 border border-amber-200/60 rounded-lg px-3 py-2">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span><strong className="font-semibold">Demo sign-in</strong> — no real account is created and no password or OTP is sent.</span>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => switchMethod("email")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${method === "email" ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary/60 text-muted-foreground hover:bg-secondary"}`}
          ><Mail className="w-4 h-4" /> Email</button>
          <button onClick={() => switchMethod("phone")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${method === "phone" ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary/60 text-muted-foreground hover:bg-secondary"}`}
          ><Phone className="w-4 h-4" /> Phone</button>
        </div>

        <AnimatePresence mode="wait">
          {method === "email" ? (
            <motion.div key="email" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
              <div>
                <label htmlFor="demo-email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input id="demo-email" type="email" placeholder="you@example.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                  className={`rounded-xl bg-secondary/50 border-0 h-12 ${errors.email ? "ring-2 ring-destructive" : ""}`}
                />
                {errors.email && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
              </div>
              <Button onClick={handleSubmit} disabled={!!validation.email} className="w-full h-12 rounded-xl text-base font-semibold gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div key="phone" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <div>
                <label htmlFor="demo-phone" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-secondary/50 rounded-xl text-sm font-semibold text-muted-foreground h-12">+91</span>
                  <Input id="demo-phone" type="tel" placeholder="10-digit mobile" value={phone}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setErrors({}); }}
                    className={`rounded-xl bg-secondary/50 border-0 h-12 ${errors.phone ? "ring-2 ring-destructive" : ""}`}
                    inputMode="numeric"
                  />
                </div>
                {errors.phone && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phone}</p>}
              </div>
              <Button onClick={handleSubmit} disabled={!!validation.phone} className="w-full h-12 rounded-xl text-base font-semibold gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthModal;
