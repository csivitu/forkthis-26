import { HeroExperience } from "@/components/landing/hero/HeroExperience";
import { TimelineSection } from "@/components/landing/timeline/TimelineSection";
import { SpeakerSection } from "@/components/speaker/SpeakerSection";
import { FAQHeader } from "@/components/faq/faq-header";
import { FAQAccordion } from "@/components/faq/faq-accordion";
import { FooterSection } from "@/components/footer/FooterSection";
import { SponsorsSection } from "@/components/sponsors/SponsorsSection";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#030305] text-white">
      <HeroExperience />
      <TimelineSection />
      <SponsorsSection />
      <SpeakerSection />

      {/* FAQ Section: Full Width to allow circuit lines and green fill to span the entire screen */}
      <section id="faqs" className="relative z-10 w-full flex flex-col items-center justify-start pb-24 overflow-x-hidden">
        <div className="relative z-10 w-full flex flex-col items-center">
          <FAQHeader />
          <div className="w-full mt-4 sm:mt-6 md:mt-8">
            <FAQAccordion />
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <FooterSection />

      <div className="scanlines pointer-events-none fixed inset-0 z-[90] opacity-40" aria-hidden="true" />
      <div className="noise-overlay pointer-events-none fixed inset-0 z-[89] opacity-35" aria-hidden="true" />
    </main>
  );
}

