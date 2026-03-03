import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

// ── Validation helpers ─────────────────────────────────────────────
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/; // Indian mobile: starts with 6-9, 10 digits
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 50;

const validateName = (name: string): string | null => {
  const trimmed = name.trim();
  if (!trimmed) return "Name is required";
  if (trimmed.length < NAME_MIN_LENGTH) return `Name must be at least ${NAME_MIN_LENGTH} characters`;
  if (trimmed.length > NAME_MAX_LENGTH) return `Name must be at most ${NAME_MAX_LENGTH} characters`;
  if (!/^[a-zA-Z\s]+$/.test(trimmed)) return "Name can only contain letters and spaces";
  return null;
};

const validateEmail = (email: string): string | null => {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required";
  if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address";
  return null;
};

const validatePhone = (phone: string): string | null => {
  if (!phone) return "Phone number is required";
  if (!PHONE_PATTERN.test(phone)) return "Enter a valid 10-digit Indian mobile number";
  return null;
};

// ────────────────────────────────────────────────────────────────────

const ProfileSetup = () => {
  const { user, updateProfile } = useAuth();
  
  // Field names for profile
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  
  // Field-level errors
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});
  
  // Track which fields have been touched
  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    phone?: boolean;
  }>({});

  // Real-time validation
  const validation = useMemo(() => {
    return {
      name: validateName(name),
      email: validateEmail(email),
      phone: validatePhone(phone),
    };
  }, [name, email, phone]);

  const isValid = !validation.name && !validation.email && !validation.phone;

  const handleBlur = (field: "name" | "email" | "phone") => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (validation[field]) {
      setErrors(prev => ({ ...prev, [field]: validation[field] ?? undefined }));
    }
  };

  const handleSave = () => {
    // Set all fields as touched
    setTouched({ name: true, email: true, phone: true });
    
    // Set all errors
    setErrors({
      name: validation.name ?? undefined,
      email: validation.email ?? undefined,
      phone: validation.phone ?? undefined,
    });

    if (!isValid) return;
    
    updateProfile({ 
      name: name.trim(), 
      email: email.trim().toLowerCase(), 
      phone 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto mt-16"
    >
      <div className="glass-card rounded-2xl card-shadow-lg p-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground text-center mb-1">Complete Your Profile</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">Tell us a bit about yourself</p>

        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Full Name <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (touched.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                onBlur={() => handleBlur("name")}
                className={`rounded-xl bg-secondary/50 border-0 h-12 pl-10 ${
                  touched.name && errors.name ? "ring-2 ring-destructive" : ""
                }`}
                maxLength={NAME_MAX_LENGTH}
              />
            </div>
            {touched.name && errors.name && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Email <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                onBlur={() => handleBlur("email")}
                className={`rounded-xl bg-secondary/50 border-0 h-12 pl-10 ${
                  touched.email && errors.email ? "ring-2 ring-destructive" : ""
                }`}
              />
            </div>
            {touched.email && errors.email && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.email}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Phone <span className="text-destructive">*</span>
            </label>
            <div className="relative flex gap-2">
              <span className="flex items-center px-3 bg-secondary/50 rounded-xl text-sm font-semibold text-muted-foreground h-12">
                +91
              </span>
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                  className={`rounded-xl bg-secondary/50 border-0 h-12 pl-10 ${
                    touched.phone && errors.phone ? "ring-2 ring-destructive" : ""
                  }`}
                  inputMode="numeric"
                />
              </div>
            </div>
            {touched.phone && errors.phone && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.phone}
              </p>
            )}
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={!isValid}
          className="w-full h-12 rounded-xl text-base font-semibold gap-2 mt-6"
        >
          <Check className="w-4 h-4" /> Save Profile
        </Button>
      </div>
    </motion.div>
  );
};

export default ProfileSetup;
