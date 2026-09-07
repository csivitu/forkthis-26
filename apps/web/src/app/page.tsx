import { HeroAudioProvider } from "@/components/landing/hero/HeroAudio";
import { HeroExperience } from "@/components/landing/hero/HeroExperience";
import { TimelineSection } from "@/components/landing/timeline/TimelineSection";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#030305] text-white">
      <HeroAudioProvider>
        <HeroExperience />
      </HeroAudioProvider>
      <TimelineSection />
      <div className="scanlines pointer-events-none fixed inset-0 z-[90] opacity-40" aria-hidden="true" />
      <div className="noise-overlay pointer-events-none fixed inset-0 z-[89] opacity-35" aria-hidden="true" />
    </main>
  );
}
