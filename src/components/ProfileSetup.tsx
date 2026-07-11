import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Check, AlertCircle, LogOut, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;
const NAME_MAX = 50;

const validateName = (v: string) => {
  const t = v.trim();
  if (!t) return "Name is required";
  if (t.length < 2) return "Name must be at least 2 characters";
  if (t.length > NAME_MAX) return `Name must be at most ${NAME_MAX} characters`;
  if (!/^[a-zA-Z\s]+$/.test(t)) return "Name can only contain letters and spaces";
  return null;
};
const validateEmail = (v: string) => (!v ? null : EMAIL_PATTERN.test(v.trim()) ? null : "Enter a valid email address");
const validatePhone = (v: string) => (!v ? null : PHONE_PATTERN.test(v) ? null : "Enter a valid 10-digit Indian mobile number");

const ProfileSetup = () => {
  const { user, updateProfile, skipProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  const errors = useMemo(() => {
    const e: { name?: string; email?: string; phone?: string; contact?: string } = {
      name: validateName(name) ?? undefined,
      email: validateEmail(email) ?? undefined,
      phone: validatePhone(phone) ?? undefined,
    };
    if (!email && !phone) e.contact = "Provide either an email or a phone number";
    return e;
  }, [name, email, phone]);

  const isValid = !errors.name && !errors.email && !errors.phone && !errors.contact;

  const handleSave = () => {
    if (!isValid) return;
    updateProfile({ name: name.trim(), email: email.trim().toLowerCase(), phone });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto mt-16">
      <div className="glass-card rounded-2xl card-shadow-lg p-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground text-center mb-1">Complete your profile</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">Demo profile — stored locally only.</p>

        <div className="space-y-4">
          <Field label="Full Name" required error={errors.name}>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Your name" value={name} maxLength={NAME_MAX}
                onChange={(e) => setName(e.target.value)}
                className={`rounded-xl bg-secondary/50 border-0 h-12 pl-10 ${errors.name ? "ring-2 ring-destructive" : ""}`}
              />
            </div>
          </Field>

          <Field label="Email" error={errors.email} hint="Provide either email or phone.">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`rounded-xl bg-secondary/50 border-0 h-12 pl-10 ${errors.email ? "ring-2 ring-destructive" : ""}`}
              />
            </div>
          </Field>

          <Field label="Phone" error={errors.phone}>
            <div className="relative flex gap-2">
              <span className="flex items-center px-3 bg-secondary/50 rounded-xl text-sm font-semibold text-muted-foreground h-12">+91</span>
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="tel" placeholder="10-digit mobile" value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  inputMode="numeric"
                  className={`rounded-xl bg-secondary/50 border-0 h-12 pl-10 ${errors.phone ? "ring-2 ring-destructive" : ""}`}
                />
              </div>
            </div>
          </Field>

          {errors.contact && (
            <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.contact}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button onClick={handleSave} disabled={!isValid} className="flex-1 h-12 rounded-xl text-base font-semibold gap-2">
            <Check className="w-4 h-4" /> Save profile
          </Button>
          <Button onClick={skipProfile} variant="outline" className="flex-1 h-12 rounded-xl text-sm font-medium gap-2">
            <SkipForward className="w-4 h-4" /> Skip for now
          </Button>
        </div>
        <Button onClick={logout} variant="ghost" className="w-full mt-2 text-muted-foreground gap-2">
          <LogOut className="w-4 h-4" /> Log out
        </Button>
      </div>
    </motion.div>
  );
};

const Field = ({ label, required, error, hint, children }: { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
    {!error && hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

export default ProfileSetup;
