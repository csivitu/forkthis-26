import type { Metadata } from "next";
import { SectionHeader } from "@/components/resources/section-header";
import { ResourceGrid } from "@/components/resources/resource-card";
import { SectionSidebar } from "@/components/resources/section-sidebar";
import { RESOURCE_SECTIONS } from "@/components/resources/resource-data";

export const metadata: Metadata = {
  title: "Resources | ForkThis",
  description: "Curated Git, GitHub, and Open Source learning resources.",
};

export default function ResourcesPage() {
  const youtubeSection = RESOURCE_SECTIONS.find((s) => s.id === "youtube")!;
  const articlesSection = RESOURCE_SECTIONS.find((s) => s.id === "articles")!;
  const githubSection = RESOURCE_SECTIONS.find((s) => s.id === "github")!;

  return (
    <div className="relative min-h-screen w-full bg-black text-white selection:bg-[#8FFE09] selection:text-black overflow-x-hidden">
      {/* Fixed right-side section navigator */}
      <SectionSidebar />

      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-20">
        {/* ── YOUTUBE VIDEOS ─────────────────────────────────────────── */}
        <section id={youtubeSection.id} className="scroll-mt-12 mb-16 sm:mb-24 md:mb-28">
          <SectionHeader title={youtubeSection.title} />

          <div className="md:pl-4 lg:pl-8 md:pr-[148px] lg:pr-[164px]">
            <ResourceGrid
              items={youtubeSection.items}
              gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 justify-items-center"
            />
          </div>
        </section>

        {/* ── ARTICLES ───────────────────────────────────────────────── */}
        <section id={articlesSection.id} className="scroll-mt-12 mb-16 sm:mb-24 md:mb-28">
          <SectionHeader title={articlesSection.title} />

          <div className="md:pl-4 lg:pl-8 md:pr-[148px] lg:pr-[164px]">
            <ResourceGrid
              items={articlesSection.items}
              gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 xl:gap-8 justify-items-center"
            />
          </div>
        </section>

        {/* ── GITHUB ─────────────────────────────────────────────────── */}
        <section id={githubSection.id} className="scroll-mt-12 pb-8">
          <SectionHeader title={githubSection.title} />

          <div className="md:pl-4 lg:pl-8 md:pr-[148px] lg:pr-[164px]">
            <ResourceGrid
              items={githubSection.items}
              gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 justify-items-center"
            />
          </div>
        </section>
      </main>
    </div>
  );
}


