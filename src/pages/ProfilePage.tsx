import { useState, useEffect, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Trash2, Plus, Loader2, AlertCircle } from "lucide-react";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import { resolveFeatureCapabilities } from "@/config/featureCapabilities";
import { useAuth } from "@/contexts/AuthContext";
import { APP_NAME, API_BASE_URL } from "@/constants";
import type { CardRecord } from "@/hooks/useUserCards";

const INDIAN_BANKS = [
  { id: "HDFC", label: "HDFC Bank" },
  { id: "ICICI", label: "ICICI Bank" },
  { id: "SBI", label: "State Bank of India" },
  { id: "AXIS", label: "Axis Bank" },
  { id: "KOTAK", label: "Kotak Mahindra Bank" },
  { id: "IDFC", label: "IDFC FIRST Bank" },
  { id: "INDUSIND", label: "IndusInd Bank" },
  { id: "AMEX", label: "American Express" },
  { id: "YES", label: "Yes Bank" },
] as const;

// ── Saved cards list ─────────────────────────────────────────────────────────

interface CardListProps {
  cards: CardRecord[];
  onRemove: (id: string) => void;
  removing: string | null;
}

const CardList = ({ cards, onRemove, removing }: CardListProps) => {
  if (cards.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground py-3">No saved cards yet.</p>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {cards.map((card) => {
        const bankLabel = INDIAN_BANKS.find((b) => b.id === card.bank_id)?.label ?? card.bank_id;
        return (
          <li
            key={card.card_id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-card px-4 py-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{bankLabel}</p>
                <p className="text-[11px] text-muted-foreground">
                  {card.payment_method === "CREDIT_CARD" ? "Credit Card" : "Debit Card"}
                  {card.card_name ? ` · ${card.card_name}` : ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => onRemove(card.card_id)}
              disabled={removing === card.card_id}
              aria-label="Remove card"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
            >
              {removing === card.card_id
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Trash2 className="w-4 h-4" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

// ── Add card form ─────────────────────────────────────────────────────────────

interface AddCardFormProps {
  onAdded: () => void;
}

const AddCardForm = ({ onAdded }: AddCardFormProps) => {
  const [bankId, setBankId] = useState<string>(INDIAN_BANKS[0].id);
  const [cardName, setCardName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CREDIT_CARD" | "DEBIT_CARD">("CREDIT_CARD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/user/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_id: bankId,
          card_name: cardName.trim() || null,
          payment_method: paymentMethod,
        }),
      });
      if (!res.ok) {
        setError("Failed to add card. Please try again.");
        return;
      }
      setCardName("");
      onAdded();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/40 bg-card p-4 flex flex-col gap-3">
      <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
        <Plus className="w-3.5 h-3.5" /> Add a card
      </h3>

      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Bank</label>
        <select
          value={bankId}
          onChange={(e) => setBankId(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border/40 bg-background text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-accent/40"
        >
          {INDIAN_BANKS.map((b) => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Card name <span className="normal-case font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="e.g. Regalia, Platinum"
          maxLength={80}
          className="h-9 px-3 rounded-lg border border-border/40 bg-background text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent/40"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Type</label>
        <div className="flex gap-2">
          {(["CREDIT_CARD", "DEBIT_CARD"] as const).map((pm) => (
            <button
              key={pm}
              type="button"
              onClick={() => setPaymentMethod(pm)}
              className={`flex-1 h-9 rounded-lg text-[13px] font-medium border transition-colors ${
                paymentMethod === pm
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border/40 hover:text-foreground hover:border-primary/30"
              }`}
            >
              {pm === "CREDIT_CARD" ? "Credit" : "Debit"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-[12px] text-destructive flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={submitting}
        className="h-9 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {submitting ? "Adding..." : "Add card"}
      </button>
    </div>
  );
};

// ── Notification prefs ────────────────────────────────────────────────────────

interface NotificationPrefs {
  notify_expiring: boolean;
  notify_new: boolean;
}

interface NotificationPrefsSectionProps {
  enabled: boolean;
}

const NotificationPrefsSection = ({ enabled }: NotificationPrefsSectionProps) => {
  const [prefs, setPrefs] = useState<NotificationPrefs>({ notify_expiring: false, notify_new: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    fetch(`${API_BASE_URL}/api/v1/user/notification-prefs`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: NotificationPrefs | null) => {
        if (data) setPrefs({ notify_expiring: Boolean(data.notify_expiring), notify_new: Boolean(data.notify_new) });
      })
      .catch(() => undefined);
  }, [enabled]);

  const savePrefs = useCallback(
    (next: NotificationPrefs) => {
      setSaving(true);
      fetch(`${API_BASE_URL}/api/v1/user/notification-prefs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      }).finally(() => setSaving(false));
    },
    []
  );

  const toggle = (key: keyof NotificationPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    savePrefs(next);
  };

  if (!enabled) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-foreground">Notification preferences</h2>
      <div className="rounded-xl border border-border/40 bg-card divide-y divide-border/30">
        {(
          [
            { key: "notify_expiring" as const, label: "Notify me when my card offers expire soon" },
            { key: "notify_new" as const, label: "Notify me when new offers are added for my cards" },
          ]
        ).map(({ key, label }) => (
          <label
            key={key}
            className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer select-none"
          >
            <span className="text-[13px] text-foreground leading-snug">{label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={prefs[key]}
              onClick={() => toggle(key)}
              disabled={saving}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none disabled:opacity-50 ${
                prefs[key] ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform ${
                  prefs[key] ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </label>
        ))}
      </div>
    </section>
  );
};

// ── Profile page ─────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const { flags } = useFeatureFlags();
  const caps = resolveFeatureCapabilities(flags);
  const { isSignedIn, user } = useAuth();

  const [cards, setCards] = useState<CardRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/user/cards`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { cards: CardRecord[] };
      setCards(data.cards ?? []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load cards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchCards(); }, [fetchCards]);

  if (!isSignedIn) return <Navigate to="/" replace />;
  if (!caps.userCards) return <Navigate to="/" replace />;

  const handleRemove = async (cardId: string) => {
    setRemoving(cardId);
    try {
      await fetch(`${API_BASE_URL}/api/v1/user/cards/${cardId}`, { method: "DELETE" });
      await fetchCards();
    } catch {
      // silent
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-5 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {APP_NAME}
        </Link>

        <header className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-2">Account</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">My Profile</h1>
          {user && (
            <p className="text-[13px] text-muted-foreground mt-1">Signed in as {user.maskedPhone}</p>
          )}
        </header>

        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-foreground">Saved cards</h2>

            {loading && (
              <div className="flex items-center gap-2 text-[13px] text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </div>
            )}
            {fetchError && !loading && (
              <p className="text-[13px] text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> {fetchError}
              </p>
            )}
            {!loading && !fetchError && (
              <CardList cards={cards} onRemove={handleRemove} removing={removing} />
            )}

            <AddCardForm onAdded={fetchCards} />
          </section>

          <NotificationPrefsSection enabled={caps.notifications} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
