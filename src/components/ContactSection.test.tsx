import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactSection from "./ContactSection";
import { SUPPORT_EMAIL } from "@/constants";

describe("ContactSection", () => {
  it("renders the support email link", () => {
    render(<ContactSection />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `mailto:${SUPPORT_EMAIL}`);
    expect(link).toHaveTextContent(SUPPORT_EMAIL);
  });

  it("does not render a phone number", () => {
    render(<ContactSection />);
    expect(document.body.innerHTML).not.toMatch(/tel:/);
    expect(document.body.innerHTML).not.toMatch(/\+91/);
  });
});
