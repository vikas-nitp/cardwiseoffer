import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DateStrip, { StripDay } from "./DateStrip";

const STRIP: StripDay[] = [
  { date: "2026-09-01", displayText: "3 offers" },
  { date: "2026-09-02", displayText: "No offers" },
  { date: "2026-09-03", displayText: "5 offers" },
];

const defaultProps = {
  selectedDate: new Date("2026-09-01T00:00:00Z"),
  onDateChange: vi.fn(),
  strip7days: STRIP,
};

describe("DateStrip", () => {
  it("marks the selected date button as aria-pressed", () => {
    render(<DateStrip {...defaultProps} />);
    const buttons = screen.getAllByRole("button", { name: /Select/ });
    const selected = buttons.find((b) => b.getAttribute("aria-pressed") === "true");
    expect(selected).toBeDefined();
    expect(selected?.textContent).toMatch(/01 Sep/);
  });

  it("marks non-selected dates as aria-pressed=false", () => {
    render(<DateStrip {...defaultProps} />);
    const buttons = screen.getAllByRole("button", { name: /Select/ });
    const notSelected = buttons.filter((b) => b.getAttribute("aria-pressed") === "false");
    expect(notSelected).toHaveLength(2);
  });

  it("includes offer count in aria-label when available", () => {
    render(<DateStrip {...defaultProps} />);
    const btn = screen.getByRole("button", { name: /01 September — 3 offers/i });
    expect(btn).toBeInTheDocument();
  });

  it("omits offer detail in aria-label for 'No offers' dates", () => {
    render(<DateStrip {...defaultProps} />);
    const btn = screen.getByRole("button", { name: /Select \w+ 02 September$/i });
    expect(btn).toBeInTheDocument();
    expect(btn.getAttribute("aria-label")).not.toContain("No offers");
  });

  it("calls onDateChange with the correct Date when a button is clicked", () => {
    const onDateChange = vi.fn();
    render(<DateStrip {...defaultProps} onDateChange={onDateChange} />);
    const sep3 = screen.getByRole("button", { name: /Thursday 03 September/i });
    fireEvent.click(sep3);
    expect(onDateChange).toHaveBeenCalledOnce();
    const called: Date = onDateChange.mock.calls[0][0];
    expect(called.getFullYear()).toBe(2026);
    expect(called.getMonth()).toBe(8); // 0-indexed: 8 = September
    expect(called.getDate()).toBe(3);
  });

  it("returns null when strip is empty", () => {
    const { container } = render(
      <DateStrip {...defaultProps} strip7days={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("hides nav arrows when all days fit in the visible window", () => {
    render(<DateStrip {...defaultProps} />);
    expect(screen.queryByRole("button", { name: /Previous eligible dates/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Next eligible dates/i })).toBeNull();
  });

  it("shows nav arrows when strip has more days than the visible window", () => {
    const manyDays: StripDay[] = Array.from({ length: 10 }, (_, i) => ({
      date: `2026-09-${String(i + 1).padStart(2, "0")}`,
      displayText: i % 2 === 0 ? "3 offers" : "No offers",
    }));
    render(<DateStrip {...defaultProps} strip7days={manyDays} />);
    expect(screen.getByRole("button", { name: /Previous eligible dates/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Next eligible dates/i })).toBeInTheDocument();
  });
});
