import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does SaveWithCard work?",
    a: "You enter your travel route, date, and optionally the bank cards you hold. We compare active bank and card offers across major travel platforms and show you which one saves the most — with clear conditions, no hidden terms.",
  },
  {
    q: "How are fee, GST, and convenience charges calculated?",
    a: "We show discount amounts based on publicly listed bank promotions. The final price you pay (including GST, convenience fees, and platform charges) is determined by the travel platform at checkout. SaveWithCard helps you compare the discount layer — not the final ticket price.",
  },
  {
    q: "Is SaveWithCard independent? Are you sponsored by any bank?",
    a: "Yes, we are fully independent. We are not sponsored, funded, or affiliated with any bank, card issuer, or travel platform. Our comparisons are based on publicly available offer data — no bias, no commissions.",
  },
  {
    q: "Can I trust the recommendations?",
    a: "Our recommendations are data-driven and transparent. We show you exactly which offer saves the most and under what conditions. We never sell tickets or push bookings — our only goal is to help you make a smarter decision before you pay.",
  },
  {
    q: "Will more banks and cards be added?",
    a: "Yes. We are continuously expanding our coverage to include more banks, card types, and travel platforms. If your bank or card isn't listed yet, it will be soon.",
  },
];

const FAQSection = () => (
  <section className="w-full max-w-3xl mx-auto animate-fade-up">
    <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-8">
      Questions
    </h2>
    <div className="bg-card/95 backdrop-blur-sm rounded-2xl card-shadow p-6 md:p-8">
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-border/50">
            <AccordionTrigger className="text-left text-sm md:text-base font-semibold text-foreground hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQSection;
