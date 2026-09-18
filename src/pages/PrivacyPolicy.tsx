import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { APP_NAME, SUPPORT_EMAIL } from "@/constants";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-base font-semibold text-foreground mb-3">{title}</h2>
    <div className="text-[13.5px] text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </section>
);

const PrivacyPolicy = () => (
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
          Last updated: September 17, 2026 &nbsp;·&nbsp; Effective date: September 17, 2026
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

        <Section title="Cookies and local storage">
          <p>
            We do not use third-party tracking cookies or analytics. We use browser{" "}
            <code className="text-[12px] bg-muted px-1.5 py-0.5 rounded font-mono">localStorage</code> to
            store your session state and UI preferences (such as your last selected airport or theme). This
            data never leaves your device.
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

export default PrivacyPolicy;
