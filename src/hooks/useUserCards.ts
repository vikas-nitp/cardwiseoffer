import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/constants";

export interface CardRecord {
  card_id: string;
  bank_id: string;
  card_name: string | null;
  payment_method: "CREDIT_CARD" | "DEBIT_CARD";
}

interface UseUserCardsOptions {
  enabled: boolean;
}

interface UseUserCardsResult {
  cards: CardRecord[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUserCards({ enabled }: UseUserCardsOptions): UseUserCardsResult {
  const [cards, setCards] = useState<CardRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    if (!enabled) {
      setCards([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/user/cards`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json() as { cards: CardRecord[] };
      setCards(data.cards ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load saved cards");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void fetch_();
  }, [fetch_]);

  return { cards, loading, error, refetch: fetch_ };
}
