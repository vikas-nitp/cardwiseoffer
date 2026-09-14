import { useState, useEffect, useRef } from "react";
import { Phone, ArrowRight, RotateCcw, CheckCircle2, ShieldCheck, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { isLocalMode } from "@/services/dataRepo";

const RESEND_SECONDS = 30;

const StepDots = ({ step }: { step: 1 | 2 | 3 }) => (
  <div className="flex items-center justify-center gap-1.5 mb-6">
    {[1, 2, 3].map((s) => (
      <span
        key={s}
        className={cn(
          "rounded-full transition-all duration-300",
          s === step ? "w-5 h-1.5 bg-accent" : s < step ? "w-1.5 h-1.5 bg-accent/50" : "w-1.5 h-1.5 bg-border"
        )}
      />
    ))}
  </div>
);

// ── Step 1: Phone ────────────────────────────────────────────────────
const PhoneStep = () => {
  const { submitPhone } = useAuth();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) { setError("Enter a valid 10-digit mobile number"); return; }
    submitPhone(digits);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <StepDots step={1} />
      <div className="text-center mb-1">
        <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
          <Phone className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Sign in</h2>
        <p className="text-[13px] text-muted-foreground mt-1">We'll send an OTP to verify your number</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Mobile Number</Label>
        <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-border focus-within:border-accent transition-colors bg-secondary/30">
          <span className="px-3 py-3 text-sm font-semibold text-muted-foreground border-r border-border bg-muted/20 select-none">
            🇮🇳 +91
          </span>
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="00000 00000"
            value={phone}
            onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
            className="flex-1 bg-transparent px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
        </div>
        {error && <p className="text-[12px] text-destructive">{error}</p>}
      </div>

      <Button type="submit" className="w-full gap-2" disabled={phone.replace(/\D/g, "").length !== 10}>
        Send OTP <ArrowRight className="w-4 h-4" />
      </Button>

      <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed">
        By continuing you agree to our{" "}
        <a href="#" className="underline underline-offset-2 hover:text-muted-foreground">Terms</a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-2 hover:text-muted-foreground">Privacy Policy</a>
      </p>
    </form>
  );
};

// ── Step 2: OTP ──────────────────────────────────────────────────────
const OtpStep = () => {
  const { pendingPhone, verifyOtp, submitPhone } = useAuth();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [verifying, setVerifying] = useState(false);
  const local = isLocalMode();

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const handleVerify = () => {
    if (otp.length !== 6) { setError("Enter the 6-digit OTP"); return; }
    setVerifying(true);
    setTimeout(() => {
      const ok = verifyOtp(otp);
      if (!ok) { setError("Invalid OTP — please try again"); setVerifying(false); }
    }, 600);
  };

  const handleResend = () => {
    submitPhone(pendingPhone);
    setOtp("");
    setError("");
    setSeconds(RESEND_SECONDS);
  };

  return (
    <div className="flex flex-col gap-5">
      <StepDots step={2} />
      <div className="text-center mb-1">
        <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Enter OTP</h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          Sent to +91 ****{pendingPhone.slice(-4)}
        </p>
      </div>

      {local && (
        <div className="bg-accent/8 border border-accent/20 rounded-xl px-3 py-2 text-center">
          <p className="text-[11px] text-accent font-medium">Demo mode — any 6-digit code works</p>
        </div>
      )}

      <div className="flex justify-center">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup className="gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="w-10 h-12 text-base rounded-xl border-border bg-secondary/30 focus:border-accent"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error && <p className="text-[12px] text-destructive text-center">{error}</p>}

      <Button onClick={handleVerify} className="w-full" disabled={otp.length !== 6 || verifying}>
        {verifying ? "Verifying…" : "Verify OTP"}
      </Button>

      <div className="text-center">
        {seconds > 0 ? (
          <p className="text-[12px] text-muted-foreground">
            Resend OTP in <span className="font-semibold text-foreground tabular-nums">{seconds}s</span>
          </p>
        ) : (
          <button onClick={handleResend} className="text-[12px] text-accent font-semibold flex items-center gap-1 mx-auto hover:opacity-80">
            <RotateCcw className="w-3 h-3" /> Resend OTP
          </button>
        )}
      </div>
    </div>
  );
};

// ── Step 3: Consent ──────────────────────────────────────────────────
const ConsentStep = () => {
  const { giveConsent } = useAuth();
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <StepDots step={3} />
      <div className="text-center mb-1">
        <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Almost there</h2>
        <p className="text-[13px] text-muted-foreground mt-1">Please review and accept our policies</p>
      </div>

      <div className="rounded-xl border border-border/60 bg-secondary/20 p-4 space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={terms}
            onCheckedChange={(v) => setTerms(Boolean(v))}
            className="mt-0.5"
          />
          <Label htmlFor="terms" className="text-[13px] text-foreground leading-relaxed cursor-pointer">
            I agree to the{" "}
            <a href="#" className="text-accent underline underline-offset-2 hover:opacity-80">
              Terms of Service
            </a>{" "}
            — CardWiseOffer provides offer comparisons for informational purposes only.
            Savings estimates are not guaranteed.
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="privacy"
            checked={privacy}
            onCheckedChange={(v) => setPrivacy(Boolean(v))}
            className="mt-0.5"
          />
          <Label htmlFor="privacy" className="text-[13px] text-foreground leading-relaxed cursor-pointer">
            I agree to the{" "}
            <a href="#" className="text-accent underline underline-offset-2 hover:opacity-80">
              Privacy Policy
            </a>{" "}
            — we collect only your mobile number to identify your account. We do not share
            it with booking platforms.
          </Label>
        </div>
      </div>

      <Button
        onClick={giveConsent}
        className="w-full"
        disabled={!terms || !privacy}
      >
        Accept &amp; Continue
      </Button>
    </div>
  );
};

// ── Step 4: Success ──────────────────────────────────────────────────
const SuccessStep = () => (
  <div className="flex flex-col items-center gap-4 py-6">
    <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center animate-scale-in">
      <CheckCircle2 className="w-8 h-8 text-accent" />
    </div>
    <div className="text-center">
      <h2 className="text-xl font-bold text-foreground tracking-tight">Welcome!</h2>
      <p className="text-[13px] text-muted-foreground mt-1">You're signed in</p>
    </div>
  </div>
);

// ── Root modal ───────────────────────────────────────────────────────
const SignInModal = () => {
  const { authStep, closeSignIn } = useAuth();
  const open = authStep !== "idle";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeSignIn()}>
      <DialogContent className="sm:max-w-[380px] rounded-2xl border-border/50 bg-card p-6">
        <DialogTitle className="sr-only">Sign in to CardWiseOffer</DialogTitle>
        {authStep === "phone" && <PhoneStep />}
        {authStep === "otp" && <OtpStep />}
        {authStep === "consent" && <ConsentStep />}
        {authStep === "success" && <SuccessStep />}
      </DialogContent>
    </Dialog>
  );
};

export default SignInModal;
