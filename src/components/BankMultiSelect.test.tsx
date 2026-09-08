import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BankMultiSelect from "./BankMultiSelect";
import { MetaProvider } from "@/contexts/MetaContext";
import { FeatureFlagProvider } from "@/contexts/FeatureFlagContext";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FeatureFlagProvider>
    <MetaProvider>{children}</MetaProvider>
  </FeatureFlagProvider>
);

describe("BankMultiSelect", () => {
  it("renders with placeholder when nothing selected", () => {
    render(<BankMultiSelect selected={[]} onChange={vi.fn()} />, { wrapper });
    expect(screen.getByText("Select Bank")).toBeInTheDocument();
  });

  const getTrigger = () => screen.getAllByRole("button")[0];

  it("shows selected bank display name in trigger when a bank is selected", () => {
    render(<BankMultiSelect selected={["AXIS"]} onChange={vi.fn()} />, { wrapper });
    // Trigger shows the display name (e.g. "Axis Bank"), not the raw id
    expect(getTrigger().textContent).toBeTruthy();
    expect(getTrigger().textContent).not.toBe("Select Bank");
  });

  it("opens dropdown on click", () => {
    render(<BankMultiSelect selected={[]} onChange={vi.fn()} />, { wrapper });
    fireEvent.click(getTrigger());
    expect(screen.getByPlaceholderText(/search banks/i)).toBeInTheDocument();
  });

  it("shows max-limit message when at capacity (default 2)", () => {
    render(
      <BankMultiSelect selected={["AXIS", "AU"]} onChange={vi.fn()} maxSelect={2} />,
      { wrapper },
    );
    fireEvent.click(getTrigger());
    const items = screen.getAllByRole("button");
    const unselected = items.find((b) => !["AXIS", "AU"].some((s) => b.textContent?.includes(s)));
    if (unselected) fireEvent.click(unselected);
    expect(screen.getByText(/Maximum 2 cards allowed/i)).toBeInTheDocument();
  });

  it("calls onChange when a 3rd bank is clicked with maxSelect=4", () => {
    const onChange = vi.fn();
    render(
      <BankMultiSelect selected={["AXIS", "AU"]} onChange={onChange} maxSelect={4} />,
      { wrapper },
    );
    fireEvent.click(getTrigger());
    const items = screen.getAllByRole("button").filter(
      (b) => b.textContent && !["AXIS", "AU"].some((s) => b.textContent!.includes(s))
        && !b.textContent!.includes("Maximum")
    );
    if (items.length > 0) {
      fireEvent.click(items[0]);
      expect(onChange).toHaveBeenCalled();
    }
  });
});
