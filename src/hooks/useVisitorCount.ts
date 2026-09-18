import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "@/constants";

const POLL_MS = 60_000;

function getVisitorId(): string {
  try {
    let id = sessionStorage.getItem("cwo_vid");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("cwo_vid", id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function useVisitorCount(enabled: boolean): number | null {
  const [count, setCount] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) { setCount(null); return; }

    const vid = getVisitorId();

    async function poll() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/visitors/count?v=${vid}`, { signal: AbortSignal.timeout(5000) });
        if (res.ok) setCount((await res.json()).count as number);
      } catch { /* non-critical */ }
    }

    poll();
    timerRef.current = setInterval(poll, POLL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [enabled]);

  return count;
}
