import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMeta } from "@/contexts/MetaContext";
import { APP_NAME } from "@/constants";

const FAQSection = () => {
  const { meta } = useMeta();

  const bankNames = meta.banks.map((b) => b.name).join(", ");
  const platformNames = meta.platforms.map((p) => p.name).join(", ");

  const faqs = [
    {
      q: `Is ${APP_NAME} free to use?`,
      a: `Yes, ${APP_NAME} is completely free. We compare publicly available bank offers to help you find the best deal.`,
    },
    {
      q: "Do you sell flight tickets?",
      a: "No. We are an independent comparison tool. We redirect you to the travel platform where you can complete your booking.",
    },
    {
      q: "Which banks and platforms do you support?",
      a: `We currently support ${bankNames} cards across ${platformNames}. We're actively expanding to include more banks and platforms.`,
    },
    {
      q: "How are the offers sourced?",
      a: `We aggregate publicly available promotions from major banks and travel platforms like ${platformNames}.`,
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

  return (
    <section className="w-full max-w-3xl mx-auto animate-fade-up">
      <div className="bg-card rounded-2xl border border-border border-t-2 border-t-accent/60 card-shadow-lg p-8 md:p-10">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1 tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-[13px] text-muted-foreground mb-6">
          Common questions about {APP_NAME}.
        </p>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-border">
              <AccordionTrigger className="text-[14px] font-semibold text-foreground hover:text-accent text-left py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-[14px] text-muted-foreground leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
