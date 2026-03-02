import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const ProfileSetup = () => {
  const { user, updateProfile, skipProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [error, setError] = useState("");

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSave = () => {
    if (!name.trim()) { setError("Name is required."); return; }
    if (!email.includes("@")) { setError("Enter a valid email."); return; }
    if (phone && phone.length < 10) { setError("Enter a valid 10-digit phone number."); return; }
    updateProfile({ name: name.trim(), email: email.trim(), phone });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop — fully opaque to prevent content bleed */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-card rounded-2xl shadow-2xl border border-border p-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground text-center mb-1">Complete Your Profile</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">Tell us a bit about yourself</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  className="rounded-xl bg-secondary/50 border-0 h-12 pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="rounded-xl bg-secondary/50 border-0 h-12 pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Phone <span className="normal-case font-normal">(optional)</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="10-digit number"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                  className="rounded-xl bg-secondary/50 border-0 h-12 pl-10"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-destructive text-sm mt-3 text-center font-medium">{error}</p>
          )}

          <Button onClick={handleSave} className="w-full h-12 rounded-xl text-base font-semibold gap-2 mt-6">
            <Check className="w-4 h-4" /> Save Profile
          </Button>

          <button
            onClick={skipProfile}
            className="w-full mt-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-center flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Skip for now
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;
