/**
 * Affiliate link infrastructure.
 *
 * Maps platform IDs to their affiliate query-param names and the Vite env var
 * that holds the tracking ID. If the env var is not set, or the URL is not on
 * the ALLOWED_HOSTS allowlist, the original URL is returned unchanged.
 *
 * isAllowed() is called first to ensure we never append tracking params to an
 * unrecognised host. OfferCard must additionally call isAllowed() on the result
 * before using it as a live href.
 */

import { isAllowed } from "@/domain/platformUrlBuilder";

interface AffiliateConfig {
  /** Query parameter name used by this platform's affiliate programme */
  param: string;
  /** Vite env var key holding the affiliate/tracking ID */
  envKey: string;
}

const AFFILIATE_CONFIGS: Record<string, AffiliateConfig> = {
  MAKEMYTRIP: { param: "aid",      envKey: "VITE_MMT_AFFILIATE_ID" },
  MMT:        { param: "aid",      envKey: "VITE_MMT_AFFILIATE_ID" },
  CLEARTRIP:  { param: "aff_id",  envKey: "VITE_CT_AFFILIATE_ID"  },
  INDIGO:     { param: "utm_source", envKey: "VITE_6E_AFFILIATE_ID"  },
  GOIBIBO:    { param: "ccde",     envKey: "VITE_GIB_AFFILIATE_ID"  },
  IXIGO:      { param: "ref",      envKey: "VITE_IXIGO_AFFILIATE_ID" },
};

/**
 * Append the affiliate tracking param to `url` for the given `platformId`.
 *
 * Returns `url` unchanged when:
 * - The URL is not on the ALLOWED_HOSTS allowlist (isAllowed returns false)
 * - No affiliate config exists for this platform
 * - The affiliate env var is not set or is empty
 */
export function buildAffiliateUrl(url: string, platformId: string): string {
  if (!isAllowed(url)) {
    return url;
  }

  const config = AFFILIATE_CONFIGS[platformId.toUpperCase()];
  if (!config) {
    return url;
  }

  const affiliateId = import.meta.env[config.envKey] as string | undefined;
  if (!affiliateId) {
    return url;
  }

  try {
    const parsed = new URL(url);
    parsed.searchParams.set(config.param, affiliateId);
    return parsed.toString();
  } catch {
    // Malformed URL — return unchanged rather than throwing
    return url;
  }
}
