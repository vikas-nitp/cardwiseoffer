import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OfferCard from "./OfferCard";
import { FeatureFlagProvider } from "@/contexts/FeatureFlagContext";
import type { OfferViewModel } from "@/types/offer";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FeatureFlagProvider>{children}</FeatureFlagProvider>
);

function makeOffer(overrides: Partial<OfferViewModel> = {}): OfferViewModel {
  return {
    id: "TEST-001",
    label: "Test Offer",
    bank: "ICICI",
    bankDisplay: "ICICI Bank",
    cardName: "ICICI Bank Credit Card",
    cardSpecificity: "ALL",
    platform: "MAKEMYTRIP",
    platformName: "MakeMyTrip",
    offerTitle: "ICICI test offer",
    platformUrl: "https://www.makemytrip.com/",
    savings: 500,
    paymentMethod: "CREDIT",
    bookingChannel: "WEB_AND_APP",
    newUserOnly: false,
    discountType: "PERCENT",
    discountValue: 10,
    maxDiscount: 1000,
    minTransaction: 5000,
    validFrom: "2026-07-01",
    expiryDate: "2027-12-31",
    eligibilityNotes: [],
    category: "FLIGHT_DOMESTIC",
    sourceType: "api",
    isActive: true,
    priorityScore: 90,
    ...overrides,
  };
}

describe("OfferCard — displayCardName", () => {
  it("strips leading bank name from card_name when it matches bankDisplay", () => {
    render(<OfferCard offer={makeOffer()} />, { wrapper });
    // "ICICI Bank Credit Card" with bankDisplay "ICICI Bank":
    // Generic remainder "Credit Card" is skipped; mid-name " Bank" is removed → "ICICI Credit Card"
    expect(screen.getByText("ICICI Credit Card")).toBeInTheDocument();
    // The full redundant string should NOT appear
    expect(screen.queryByText("ICICI Bank Credit Card")).toBeNull();
  });

  it("shows full card_name when it does not start with bank name", () => {
    render(
      <OfferCard
        offer={makeOffer({
          bankDisplay: "HDFC Bank",
          cardName: "Regalia Gold Credit Card",
        })}
      />,
      { wrapper },
    );
    expect(screen.getByText("Regalia Gold Credit Card")).toBeInTheDocument();
  });

  it("falls back to bankDisplay when card_name is null", () => {
    render(
      <OfferCard
        offer={makeOffer({
          bankDisplay: "Axis Bank",
          cardName: null,
        })}
      />,
      { wrapper },
    );
    expect(screen.getByText("Axis Bank")).toBeInTheDocument();
  });

  it("strip is case-insensitive (mixed-case bank name prefix)", () => {
    render(
      <OfferCard
        offer={makeOffer({
          bankDisplay: "SBI",
          cardName: "SBI Credit Card",
        })}
      />,
      { wrapper },
    );
    // "SBI Credit Card" with bankDisplay "SBI": "Credit Card" is a generic remainder, so
    // the full name is kept (no " Bank" to remove via mid-name strip) → "SBI Credit Card"
    expect(screen.getByText("SBI Credit Card")).toBeInTheDocument();
  });
});
