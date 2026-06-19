import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/common/accordion"
import { faqs, faqSection } from "../bbl-landing-content"
import { SectionHeading } from "./landing-chrome"

export const BblFaq = () => (
  <section className="w-full max-w-3xl mx-auto space-y-8">
    <SectionHeading eyebrow={faqSection.eyebrow} title={faqSection.title} />
    <Accordion className="space-y-3">
      {faqs.map(item => (
        <AccordionItem key={item.question} value={item.question}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </section>
)
