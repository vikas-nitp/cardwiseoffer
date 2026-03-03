/**
 * SIMPLE TEST PAGE - Mock Data Only
 * This is a simplified test page to verify UI components work before backend integration
 */

import { useState } from "react";
import { format } from "date-fns";
import SearchCard from "@/components/SearchCard";
import OfferCard from "@/components/OfferCard";
import DateStrip from "@/components/DateStrip";
import { fetchSearchResults, ALL_PLATFORMS } from "@/services/mockApi";
import { CITIES } from "@/constants";
import type { CityOption } from "@/components/CityAutocomplete";
import { Loader2, AlertCircle, ArrowRight, Pencil } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface OfferTile {
  id: string;
  label: string;
  platform: string;
  platformUrl: string;
  bank: string | null;
  discount: number;
  conditions: string[];
}

interface SearchState {
  from: CityOption;
  to: CityOption;
  date: Date;
}

const MockTestPage = () => {
  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (from: CityOption, to: CityOption, date: Date) => {
    setSearchState({ from, to, date });
    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 Searching: ${from.city} → ${to.city} on ${format(date, "MMM dd, yyyy")}`);
      const results = fetchSearchResults(from, to, date, []);
      console.log(`✅ Got ${results.length} offers from mock data`);
      setOffers(results);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Search failed";
      console.error("❌ Search error:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate: Date) => {
    if (searchState) {
      const updated = { ...searchState, date: newDate };
      setSearchState(updated);
      setLoading(true);

      try {
        const results = fetchSearchResults(updated.from, updated.to, newDate, []);
        setOffers(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Date change failed");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        <h1 className="text-2xl font-bold text-center">
          🧪 UI Test - Mock Data (No Backend)
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {!searchState ? (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-8">Find Flight Offers</h2>
            <SearchCard onSearch={handleSearch} />
            
            <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 mb-4">
                ℹ️ This is a mock UI test page with hardcoded data
              </p>
              <ul className="text-sm text-blue-600 space-y-2 text-left inline-block">
                <li>✅ Displays real React components</li>
                <li>✅ Uses mock data generator</li>
                <li>✅ No backend API calls</li>
                <li>✅ Tests UI responsiveness</li>
              </ul>
            </div>
          </div>
        ) : (
          <div>
            {/* Search Summary */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <button
                onClick={() => setSearchState(null)}
                className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
              >
                <Pencil size={16} />
                Edit Search
              </button>

              <div className="flex items-center gap-8 flex-wrap">
                <div>
                  <p className="text-xs text-gray-500 uppercase">From</p>
                  <p className="text-lg font-semibold">{searchState.from.city}</p>
                </div>
                <ArrowRight className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">To</p>
                  <p className="text-lg font-semibold">{searchState.to.city}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Date</p>
                  <p className="text-lg font-semibold">
                    {format(searchState.date, "MMM dd")}
                  </p>
                </div>
              </div>
            </div>

            {/* Date Strip */}
            {!loading && offers.length > 0 && (
              <DateStrip
                selectedDate={searchState.date}
                onDateChange={handleDateChange}
                getMinPrice={() => 1600}
              />
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading offers...</p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert className="mb-8 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            )}

            {/* Offers Grid */}
            {!loading && offers.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-6">
                  {offers.length} Offers Available
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {offer.platform}
                          </p>
                          <h3 className="text-lg font-bold text-gray-900">
                            ₹{offer.discount}
                          </h3>
                        </div>
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {offer.label}
                        </span>
                      </div>

                      {offer.bank && (
                        <p className="text-sm text-gray-600 mb-3">
                          💳 {offer.bank}
                        </p>
                      )}

                      <div className="space-y-2 mb-4">
                        {offer.conditions.slice(0, 3).map((cond, i) => (
                          <p key={i} className="text-xs text-gray-500">
                            ✓ {cond}
                          </p>
                        ))}
                      </div>

                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => window.open(offer.platformUrl, "_blank")}
                      >
                        View Offer
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && offers.length === 0 && !error && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No offers found</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MockTestPage;
