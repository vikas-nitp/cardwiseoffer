import { Link, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { APP_NAME, SUPPORT_EMAIL, DISCLAIMER_TEXT } from "@/constants";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-base font-semibold text-foreground mb-3">{title}</h2>
    <div className="text-[13.5px] text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </section>
);

const TermsOfService = () => {
  const { flags } = useFeatureFlags();
  if (!flags.termsOfServiceEnabled) return <Navigate to="/" replace />;
  return (
  <div className="min-h-screen bg-background">
    <div className="max-w-2xl mx-auto px-5 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {APP_NAME}
      </Link>

      <header className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-2">Legal</p>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Terms of Service</h1>
        <p className="text-[13px] text-muted-foreground mt-2">
          Last updated: September 17, 2026 &nbsp;·&nbsp; Effective date: September 17, 2026
        </p>
      </header>

      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 mb-8">
        <p className="text-[13px] text-accent/90 leading-relaxed">{DISCLAIMER_TEXT}</p>
      </div>

      <div className="border-t border-border/50 pt-8">
        <Section title="Acceptance of terms">
          <p>
            By accessing or using {APP_NAME} ("the Service"), you agree to be bound by these Terms of
            Service. If you do not agree to these terms, please do not use the Service.
          </p>
        </Section>

        <Section title="Nature of the service">
          <p>
            {APP_NAME} is an{" "}
            <strong className="text-foreground/80">independent, informational comparison tool</strong> for
            credit and debit card offers on Indian domestic flights. We aggregate publicly available offer
            information from bank and booking platform promotions to help you identify which card may provide
            the best deal for a given search.
          </p>
          <p>
            {APP_NAME} is <strong className="text-foreground/80">not a booking platform</strong>. We do not
            process flight bookings, payments, or reservations of any kind.
          </p>
        </Section>

        <Section title="No affiliation with banks or platforms">
          <p>
            {APP_NAME} is independently operated and is{" "}
            <strong className="text-foreground/80">
              not affiliated with, endorsed by, or sponsored by
            </strong>{" "}
            any bank (including but not limited to HDFC Bank, ICICI Bank, SBI, Axis Bank, Kotak, IDFC First,
            or IndusInd) or any booking platform (including but not limited to MakeMyTrip, IndiGo, Cleartrip,
            Goibibo, or Ixigo).
          </p>
          <p>
            All bank and platform names, trademarks, and logos are the property of their respective owners.
            Their use on this site is for identification purposes only.
          </p>
        </Section>

        <Section title="Accuracy of offer information">
          <p>
            We make reasonable efforts to keep offer information current. However, card offers, coupon codes,
            discount amounts, and eligibility conditions are set by banks and platforms and can change without
            notice.
          </p>
          <p>
            <strong className="text-foreground/80">Savings estimates shown on this site are not
            guaranteed.</strong> Always verify the current offer terms directly on the bank's or booking
            platform's official website before making a purchase decision.
          </p>
          <p>
            {APP_NAME} is not responsible for any discrepancy between the offer information displayed on this
            site and the actual offer applied at checkout.
          </p>
        </Section>

        <Section title="Not financial advice">
          <p>
            Nothing on this site constitutes financial advice, credit card recommendation, or any other
            professional advice. The Service is provided for informational purposes only. You should consult
            your bank or a qualified financial advisor before making any financial decisions.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>You agree to use the Service only for lawful, personal, non-commercial purposes. You must not:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Scrape, crawl, or systematically download content from the Service.</li>
            <li>Attempt to gain unauthorized access to any part of the Service or its infrastructure.</li>
            <li>Use the Service in a way that could harm, disable, or impair it.</li>
            <li>Use automated tools to query the Service at a rate that would constitute abuse.</li>
          </ul>
        </Section>

        <Section title="Limitation of liability">
          <p>
            To the maximum extent permitted by applicable law, {APP_NAME} and its operators shall not be
            liable for any indirect, incidental, special, consequential, or punitive damages arising from your
            use of, or inability to use, the Service or the information provided therein — including but not
            limited to loss of money, lost savings, or missed offers.
          </p>
          <p>
            Our total liability to you for any claim arising out of these terms or your use of the Service
            shall not exceed ₹0 (the Service is provided free of charge).
          </p>
        </Section>

        <Section title="Third-party links">
          <p>
            The Service may link to external websites (such as official bank or booking platform pages).
            These links are provided for your convenience. We have no control over the content of those sites
            and accept no responsibility for them or for any loss or damage that may arise from your use of them.
          </p>
        </Section>

        <Section title="Governing law and jurisdiction">
          <p>
            These terms shall be governed by and construed in accordance with the laws of{" "}
            <strong className="text-foreground/80">India</strong>, without regard to its conflict of law
            provisions. Any disputes arising from these terms shall be subject to the exclusive jurisdiction
            of the courts of India.
          </p>
        </Section>

        <Section title="Changes to these terms">
          <p>
            We may update these terms from time to time. The "Last updated" date at the top of this page will
            reflect any changes. Continued use of the Service after a change constitutes acceptance of the
            updated terms.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            For questions about these terms, contact us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent underline underline-offset-2">
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  </div>
  );
};

export default TermsOfService;
