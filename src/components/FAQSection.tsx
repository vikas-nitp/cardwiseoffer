import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is CardWiseOffer free to use?",
    a: "Yes, CardWiseOffer is completely free. We compare publicly available bank offers to help you find the best deal.",
  },
  {
    q: "Do you sell flight tickets?",
    a: "No. We are an independent comparison tool. We redirect you to the travel platform where you can complete your booking.",
  },
  {
    q: "Which banks and platforms do you support?",
    a: "We currently support HDFC, ICICI, SBI, Axis, and American Express cards across MakeMyTrip, Cleartrip, EaseMyTrip, and Goibibo. We're actively expanding to include more banks and platforms.",
  },
  {
    q: "How are the offers sourced?",
    a: "We aggregate publicly available promotions from major banks and travel platforms like MakeMyTrip, Cleartrip, EaseMyTrip, and Goibibo.",
  },
  {
    q: "Why do I need to log in?",
    a: "Login lets you see all available offers. Non-logged-in users can preview a limited number of offers before signing in.",
  },
  {
    q: "How many cards can I compare at once?",
    a: "You can select up to 2 cards for comparison. The system will show the best offers for your selected cards and suggest better alternatives if available.",
  },
  {
    q: "Are the savings amounts guaranteed?",
    a: "Savings shown are based on publicly listed bank promotions. Final eligibility depends on the platform's and bank's terms and conditions.",
  },
];

const FAQSection = () => (
  <section className="w-full max-w-3xl mx-auto animate-fade-up">
    <div className="glass-card rounded-2xl card-shadow-lg p-8 md:p-12">
      <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
        Frequently Asked Questions
      </h2>
      <p className="text-muted-foreground mb-6">
        Common questions about CardWiseOffer.
      </p>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-border/50">
            <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary text-left py-4">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQSection;
