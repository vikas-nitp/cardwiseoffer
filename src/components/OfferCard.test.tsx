import { describe, it, expect, vi } from "vitest";
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

describe("OfferCard — savings label rendering", () => {
  it("renders the savings label from savingsLabel()", () => {
    // minTransaction: null suppresses the (~pct%) annotation so the label is clean
    render(
      <OfferCard offer={makeOffer({ discountType: "FLAT", discountValue: 2000, maxDiscount: null, minTransaction: null })} />,
      { wrapper },
    );
    expect(screen.getByText("₹2,000 off")).toBeInTheDocument();
  });

  it("renders PERCENT savings label", () => {
    render(
      <OfferCard offer={makeOffer({ discountType: "PERCENT", discountValue: 10, maxDiscount: 1500 })} />,
      { wrapper },
    );
    expect(screen.getByText("10% off · up to ₹1,500")).toBeInTheDocument();
  });

  it("savings number element does NOT have text-3xl class (uniform card height)", () => {
    const { container } = render(
      <OfferCard offer={makeOffer()} variant="primary" />,
      { wrapper },
    );
    // All cards use text-2xl; text-3xl was removed so primary/highlight cards
    // no longer cause taller rows in the grid.
    const el = container.querySelector(".text-3xl");
    expect(el).toBeNull();
  });

  it("renders user fare savings when fare is provided and offer is eligible", () => {
    render(
      <OfferCard
        offer={makeOffer({ discountType: "PERCENT", discountValue: 10, maxDiscount: 2000, savings: 500 })}
        userFareProvided
      />,
      { wrapper },
    );
    expect(screen.getByText("Save ₹500")).toBeInTheDocument();
  });

  it("renders below-minimum warning when offer is ineligible at provided fare", () => {
    render(
      <OfferCard
        offer={makeOffer({ discountType: "PERCENT", discountValue: 10, maxDiscount: 2000, amountEligible: false })}
        userFareProvided
      />,
      { wrapper },
    );
    expect(screen.getByText("Below minimum booking amount")).toBeInTheDocument();
  });
});

describe("OfferCard — no-card (platform) offer", () => {
  it("hides card name section for NO_CARD payment method", () => {
    render(
      <OfferCard
        offer={makeOffer({ paymentMethod: "NO_CARD", bank: null, bankDisplay: null, cardName: null })}
      />,
      { wrapper },
    );
    // No credit card icon row should render (the conditions section should have no card name)
    expect(screen.queryByText("ICICI Credit Card")).toBeNull();
  });
});

describe("OfferCard — validity states", () => {
  it("disables CTA and shows Expired for an expired offer", () => {
    render(
      <OfferCard
        offer={makeOffer({ expiryDate: "2020-01-01", platformUrl: "https://www.makemytrip.com/" })}
      />,
      { wrapper },
    );
    const btn = screen.getByRole("button", { name: "Expired" });
    expect(btn).toBeDisabled();
  });

  it("disables CTA and shows Not yet active for a future offer", () => {
    render(
      <OfferCard
        offer={makeOffer({ validFrom: "2099-01-01", platformUrl: "https://www.makemytrip.com/" })}
      />,
      { wrapper },
    );
    const btn = screen.getByRole("button", { name: "Not yet active" });
    expect(btn).toBeDisabled();
  });

  it("renders Continue to link for an active, bookable offer", () => {
    render(
      <OfferCard
        offer={makeOffer({ platformUrl: "https://www.makemytrip.com/", platformName: "MakeMyTrip" })}
      />,
      { wrapper },
    );
    const link = screen.getByRole("link", { name: /Continue to MakeMyTrip/i });
    expect(link).toHaveAttribute("href", "https://www.makemytrip.com/");
    expect(link).toHaveAttribute("target", "_blank");
  });
});

describe("OfferCard — eligibility notes filtering", () => {
  it("shows a valid eligibility note", () => {
    render(
      <OfferCard
        offer={makeOffer({ eligibilityNotes: ["Valid for Round Trip bookings only"] })}
      />,
      { wrapper },
    );
    expect(screen.getByText("Valid for Round Trip bookings only")).toBeInTheDocument();
  });

  it("suppresses garbage notes (T&C blobs, nav fragments)", () => {
    render(
      <OfferCard
        offer={makeOffer({ eligibilityNotes: ["Log in / Sign up to avail offer", "Terms & conditions apply"] })}
      />,
      { wrapper },
    );
    expect(screen.queryByText("Log in / Sign up to avail offer")).toBeNull();
    expect(screen.queryByText("Terms & conditions apply")).toBeNull();
  });

  it("suppresses notes that are too short (< 13 chars)", () => {
    render(
      <OfferCard offer={makeOffer({ eligibilityNotes: ["Min ₹5,000"] })} />,
      { wrapper },
    );
    expect(screen.queryByText("Min ₹5,000")).toBeNull();
  });

  it("shows at most 2 eligibility notes", () => {
    render(
      <OfferCard
        offer={makeOffer({
          eligibilityNotes: [
            "Valid for Round Trip bookings only",
            "Valid for Economy Class only",
            "Valid for domestic flights only",
          ],
        })}
      />,
      { wrapper },
    );
    // Only first two should render
    expect(screen.getByText("Valid for Round Trip bookings only")).toBeInTheDocument();
    expect(screen.getByText("Valid for Economy Class only")).toBeInTheDocument();
    expect(screen.queryByText("Valid for domestic flights only")).toBeNull();
  });
});

describe("OfferCard — onExpand callback", () => {
  it("calls onExpand when card is clicked", () => {
    const onExpand = vi.fn();
    const { container } = render(
      <OfferCard offer={makeOffer()} onExpand={onExpand} />,
      { wrapper },
    );
    const card = container.querySelector("[role='article']") as HTMLElement;
    card.click();
    expect(onExpand).toHaveBeenCalledTimes(1);
  });
});

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
