import { useState } from "react";
import { API_BASE_URL } from "@/constants";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import { resolveFeatureCapabilities } from "@/config/featureCapabilities";

const EmailCaptureBar = () => {
  const { flags } = useFeatureFlags();
  const caps = resolveFeatureCapabilities(flags);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!caps.subscriptions) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/subscriptions/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "footer" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg =
          data?.error?.message ?? (res.status === 422 ? "Invalid email address" : "Something went wrong");
        setErrorMsg(msg);
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMsg("Something went wrong");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center justify-center py-1.5">
        <span className="text-[12px] font-medium text-accent">You're in!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Get offer alerts"
          disabled={status === "submitting"}
          className="h-8 px-3 rounded-lg border border-border/40 bg-background text-[12px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent/40 disabled:opacity-50 w-44"
        />
        <button
          type="submit"
          disabled={status === "submitting" || !email.trim()}
          className="h-8 px-3 rounded-lg bg-accent text-accent-foreground text-[12px] font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {status === "submitting" ? "..." : "Notify me"}
        </button>
      </div>
      {status === "error" && errorMsg && (
        <p className="text-[11px] text-destructive">{errorMsg}</p>
      )}
    </form>
  );
};

export default EmailCaptureBar;
