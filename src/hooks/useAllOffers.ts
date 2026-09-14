import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { OfferViewModel } from "@/types/offer";
import { repoFetchAllOffersPage, isLocalMode } from "@/services/dataRepo";
import { filterCatalogueOffers } from "@/domain/offerFiltering";
import { analytics } from "@/services/analytics";

export function useAllOffers(isActive: boolean, publicAllOffersEnabled: boolean) {
  const [allOffers, setAllOffers] = useState<OfferViewModel[]>([]);
  const [offersPage, setOffersPage] = useState(1);
  const [offersTotalPages, setOffersTotalPages] = useState(1);
  const [offersTotalCount, setOffersTotalCount] = useState(0);
  const [offersLimit, setOffersLimit] = useState(20);
  const [allOffersLoading, setAllOffersLoading] = useState(false);
  const [allOffersError, setAllOffersError] = useState<string | null>(null);
  const [bankFilter, setBankFilter] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string[]>([]);
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  const offersController = useRef<AbortController | null>(null);

  const fetchOffers = useCallback(async () => {
    analytics.track("all_offers");
    offersController.current?.abort();
    const ctrl = new AbortController();
    offersController.current = ctrl;
    setAllOffersLoading(true);
    setAllOffersError(null);
    try {
      // Expand WEB/APP selection to also include WEB_AND_APP offers
      const expandedChannels = channelFilter.length > 0
        ? [...new Set([
            ...channelFilter,
            ...(channelFilter.includes("WEB") || channelFilter.includes("APP") ? ["WEB_AND_APP"] : []),
          ])]
        : undefined;
      const result = await repoFetchAllOffersPage({
        bank: bankFilter,
        platform: platformFilter,
        payment_method: paymentFilter,
        booking_channel: expandedChannels,
        page: offersPage,
        limit: offersLimit,
      }, ctrl.signal);
      if (ctrl.signal.aborted) return;
      setAllOffers(result.offers);
      setOffersTotalPages(result.pagination.total_pages);
      setOffersTotalCount(result.pagination.total ?? 0);
    } catch (err) {
      if (ctrl.signal.aborted) return;
      setAllOffersError(err instanceof Error ? err.message : "Failed to fetch offers.");
      setAllOffers([]);
    } finally {
      if (offersController.current === ctrl) setAllOffersLoading(false);
    }
  }, [bankFilter, platformFilter, paymentFilter, channelFilter, offersPage, offersLimit]);

  useEffect(() => {
    if (isActive && publicAllOffersEnabled) fetchOffers();
  }, [isActive, publicAllOffersEnabled, fetchOffers]);

  useEffect(() => () => { offersController.current?.abort(); }, []);

  const filteredAllOffers = useMemo(() => {
    if (!isLocalMode()) return allOffers;
    return filterCatalogueOffers(allOffers, {
      bank: bankFilter,
      platform: platformFilter,
      paymentMethod: paymentFilter,
      channel: channelFilter,
    });
  }, [allOffers, bankFilter, platformFilter, paymentFilter, channelFilter]);

  const handleBankFilterChange = useCallback((v: string[]) => { setBankFilter(v); setOffersPage(1); }, []);
  const handlePlatformFilterChange = useCallback((v: string[]) => { setPlatformFilter(v); setOffersPage(1); }, []);
  const handlePaymentFilterChange = useCallback((v: string[]) => { setPaymentFilter(v); setOffersPage(1); }, []);
  const handleChannelFilterChange = useCallback((v: string[]) => { setChannelFilter(v); setOffersPage(1); }, []);
  const handleResetFilters = useCallback(() => {
    setBankFilter([]); setPlatformFilter([]); setPaymentFilter([]); setChannelFilter([]);
    setOffersPage(1);
  }, []);

  return {
    filteredAllOffers, allOffersLoading, allOffersError,
    bankFilter, platformFilter, paymentFilter, channelFilter,
    offersPage, setOffersPage, offersTotalPages, offersTotalCount,
    offersLimit, setOffersLimit,
    handleBankFilterChange, handlePlatformFilterChange, handlePaymentFilterChange, handleChannelFilterChange,
    handleResetFilters,
  };
}
