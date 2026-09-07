import type { Metadata } from "next";
import { Starfield } from "@/components/faq/starfield";
import { FAQHeader } from "@/components/faq/faq-header";
import { FAQAccordion } from "@/components/faq/faq-accordion";

export const metadata: Metadata = {
  title: "FAQs | ForkThis",
  description: "Frequently Asked Questions for the ForkThis Open Source Event",
};

export default function FAQsPage() {
  return (
    <main className="relative min-h-screen w-full bg-black text-white overflow-x-hidden flex flex-col items-center justify-start pb-24">
      {/* Starfield Pitch Black Background */}
      <Starfield />

      {/* Main Content Area: Full Width to allow circuit lines and cards to span the page */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Title: FΔQS */}
        <FAQHeader />

        {/* Full-width Accordion List */}
        <div className="w-full mt-4 sm:mt-6 md:mt-8">
          <FAQAccordion />
        </div>
      </div>
    </main>
  );
}
