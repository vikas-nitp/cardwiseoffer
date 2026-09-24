import { Link, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { APP_NAME, APP_DOMAIN, SUPPORT_EMAIL, GRIEVANCE_EMAIL } from "@/constants";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import LegalSection from "@/components/LegalSection";

const Section = LegalSection;

const PrivacyPolicy = () => {
  const { flags } = useFeatureFlags();
  if (!flags.privacyPolicyEnabled) return <Navigate to="/" replace />;
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
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Privacy Policy</h1>
        <p className="text-[13px] text-muted-foreground mt-2">
          Last updated: September 20, 2026 &nbsp;·&nbsp; Effective date: September 17, 2026
        </p>
      </header>

      <div className="border-t border-border/50 pt-8">
        <Section title="Overview">
          <p>
            {APP_NAME} ("we", "our", "us") is a flight card-offer comparison tool. We are committed to
            protecting your personal data in accordance with India's{" "}
            <strong className="text-foreground/80">Digital Personal Data Protection (DPDP) Act, 2023</strong>.
          </p>
          <p>
            This policy describes what personal data we collect, why we collect it, how it is stored, and your
            rights as a data principal.
          </p>
        </Section>

        <Section title="What data we collect">
          <p>We collect only the minimum data necessary to operate the service:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>
              <strong className="text-foreground/80">Mobile number</strong> — collected when you sign in or
              create an account. Used solely to identify your account. Stored in hashed/masked form after
              verification.
            </li>
            <li>
              <strong className="text-foreground/80">Session data</strong> — an anonymous session identifier
              stored in your browser's local storage. Used to count unique visitors. Contains no personal
              information.
            </li>
          </ul>
          <p className="mt-3">
            We do <strong className="text-foreground/80">not</strong> collect your name, email address,
            payment card details, travel itinerary, or any other personal data beyond the above.
          </p>
        </Section>

        <Section title="Why we collect it">
          <p>Your mobile number is used for one purpose only:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>
              <strong className="text-foreground/80">Account identification</strong> — to link your
              preferences and saved state to your account via OTP-based sign-in.
            </li>
          </ul>
          <p className="mt-3">
            The session identifier is used to estimate the number of unique visitors so we can understand
            usage. No individual visitor is tracked or profiled.
          </p>
        </Section>

        <Section title="Data sharing and third parties">
          <p>
            We <strong className="text-foreground/80">do not sell, rent, or share</strong> your mobile number
            or any personal data with booking platforms (MakeMyTrip, IndiGo, etc.), banks, advertisers, or
            any other third party.
          </p>
          <p>
            Offer data displayed on this site is sourced from publicly available bank and booking platform
            promotions. Submitting a search does not send your personal data to any external service.
          </p>
        </Section>

        <Section title="Data retention">
          <p>
            Your mobile number is retained for as long as your account is active. If you request deletion of
            your account, all personal data associated with it is permanently removed within 30 days.
          </p>
        </Section>

        <Section title="Your rights under the DPDP Act, 2023">
          <p>As a data principal, you have the following rights:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>
              <strong className="text-foreground/80">Right to access</strong> — request a summary of the
              personal data we hold about you.
            </li>
            <li>
              <strong className="text-foreground/80">Right to correction</strong> — request correction of
              inaccurate personal data.
            </li>
            <li>
              <strong className="text-foreground/80">Right to erasure</strong> — request deletion of your
              personal data.
            </li>
            <li>
              <strong className="text-foreground/80">Right to withdraw consent</strong> — withdraw consent at
              any time; this will not affect the lawfulness of processing before withdrawal.
            </li>
            <li>
              <strong className="text-foreground/80">Right to grievance redressal</strong> — raise a complaint
              with us; if unresolved, escalate to the Data Protection Board of India.
            </li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, contact us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent underline underline-offset-2">
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </Section>

        <Section title="Browser storage">
          <p>
            We do not use third-party tracking cookies or analytics. We use browser{" "}
            <code className="text-[12px] bg-muted px-1.5 py-0.5 rounded font-mono">localStorage</code>{" "}
            and{" "}
            <code className="text-[12px] bg-muted px-1.5 py-0.5 rounded font-mono">sessionStorage</code>{" "}
            to store:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>
              <strong className="text-foreground/80">Your preferences</strong> — last selected origin airport,
              destination, travel date, and UI theme. Stored in <code className="text-[12px] bg-muted px-1.5 py-0.5 rounded font-mono">localStorage</code>.
            </li>
            <li>
              <strong className="text-foreground/80">Selected bank cards</strong> — the credit/debit card
              selections you make during a search session. Stored in{" "}
              <code className="text-[12px] bg-muted px-1.5 py-0.5 rounded font-mono">sessionStorage</code>; cleared when you close the tab.
            </li>
            <li>
              <strong className="text-foreground/80">Anonymous visitor ID</strong> — a randomly generated
              identifier used to count unique sessions. Contains no personal information.
              Stored in <code className="text-[12px] bg-muted px-1.5 py-0.5 rounded font-mono">localStorage</code>.
            </li>
          </ul>
          <p className="mt-3">
            All browser storage data stays entirely on your device. To clear it: open your browser's
            Settings → Privacy &amp; Security → Clear browsing data → Cookies and site data, and select
            <strong className="text-foreground/80"> {APP_DOMAIN}</strong>.
          </p>
        </Section>

        <Section title="Third-party processors">
          <p>
            We use a single third-party service to process your data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>
              <strong className="text-foreground/80">SMS / OTP delivery</strong> — your mobile number is
              transmitted to our SMS authentication provider solely to deliver a one-time verification code.
              The provider processes your number for this purpose only and does not retain it for marketing
              or analytics. A Data Processor Agreement is in place with this provider under the DPDP Act 2023.
            </li>
          </ul>
          <p className="mt-3">
            No other third-party service receives your personal data. Offer search results are generated
            entirely within our own infrastructure.
          </p>
        </Section>

        <Section title="Children">
          <p>
            {APP_NAME} is not directed to children under 18 years of age. We do not knowingly collect
            personal data from minors.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            We may update this policy from time to time. The "Last updated" date at the top of this page will
            reflect any changes. Continued use of the service after a change constitutes acceptance of the
            updated policy.
          </p>
        </Section>

        <Section title="Grievance Officer">
          <p>
            In accordance with the Digital Personal Data Protection Act, 2023 (§13), we have designated a
            Grievance Officer to address data-related complaints:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>
              <strong className="text-foreground/80">Role:</strong> Data Protection Officer, {APP_NAME}
            </li>
            <li>
              <strong className="text-foreground/80">Email:</strong>{" "}
              <a href={`mailto:${GRIEVANCE_EMAIL}`} className="text-primary underline underline-offset-2">
                {GRIEVANCE_EMAIL}
              </a>
            </li>
            <li>
              <strong className="text-foreground/80">Response SLA:</strong> Acknowledgement within 7 days;
              final resolution within 30 days of receipt.
            </li>
          </ul>
          <p className="mt-3">
            If your grievance is not resolved within 30 days, you may escalate to the{" "}
            <strong className="text-foreground/80">Data Protection Board of India</strong> at{" "}
            <a
              href="https://dpboard.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2"
            >
              dpboard.gov.in
            </a>
            .
          </p>
        </Section>

        <Section title="Affiliate disclosure">
          <p>
            {APP_NAME} may earn a commission when you complete a booking through links on this site.
            This comes at no additional cost to you. We only link to platforms whose offers we index —
            affiliate relationships do not influence offer rankings or the data we display.
          </p>
        </Section>

        <Section title="No affiliation with platforms or banks">
          <p>
            {APP_NAME} is an independent comparison tool. We are not affiliated with, endorsed by, or
            sponsored by MakeMyTrip, Cleartrip, Ixigo, or any bank. Offer details are sourced from
            publicly available pages and may change — always verify on the official platform before booking.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            For privacy-related questions or to exercise your rights, contact us at{" "}
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

export default PrivacyPolicy;
