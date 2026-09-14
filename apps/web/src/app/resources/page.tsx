import type { Metadata } from "next";
import { SectionHeader } from "@/components/resources/section-header";
import { SiteHeader } from "@/components/landing/navigation/SiteHeader";
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
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    boxSizing: "border-box",
    border: "3px solid #6AA121",
    pointerEvents: "none",
    zIndex: 9999,
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white selection:bg-[#8FFE09] selection:text-black overflow-x-hidden pt-14 sm:pt-0">
      <div aria-hidden style={overlayStyle} />

      <div>
        <SiteHeader forceTimeline />
        <SectionSidebar />

        <main className="w-full max-w-[1540px] mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-20">
          {/* YOUTUBE */}
          <section id={youtubeSection.id} className="scroll-mt-20 mb-16 sm:mb-24 md:mb-28">
            <SectionHeader title={youtubeSection.title} />

            <div className="md:pl-2 lg:pl-6 md:pr-[clamp(130px,16vw,180px)] lg:pr-[clamp(150px,13vw,200px)]">
              <ResourceGrid
                items={youtubeSection.items}
                gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8 lg:gap-10 xl:gap-12 justify-items-center"
                cardMaxWidthClass="max-w-[280px] sm:max-w-[430px] md:max-w-[460px]"
              />
            </div>
          </section>

          {/* ARTICLES */}
          <section id={articlesSection.id} className="scroll-mt-20 mb-16 sm:mb-24 md:mb-28">
            <SectionHeader title={articlesSection.title} />

            <div className="md:pl-2 lg:pl-6 md:pr-[clamp(130px,16vw,180px)] lg:pr-[clamp(150px,13vw,200px)]">
              <ResourceGrid
                items={articlesSection.items}
                gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-7 xl:gap-8 justify-items-center"
                cardMaxWidthClass="max-w-[280px] sm:max-w-[430px] md:max-w-[460px]"
              />
            </div>
          </section>

          {/* GITHUB */}
          <section id={githubSection.id} className="scroll-mt-20 pb-8">
            <SectionHeader title={githubSection.title} />

            <div className="md:pl-2 lg:pl-6 md:pr-[clamp(130px,16vw,180px)] lg:pr-[clamp(150px,13vw,200px)]">
              <ResourceGrid
                items={githubSection.items}
                gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8 lg:gap-10 xl:gap-12 justify-items-center"
                cardMaxWidthClass="max-w-[280px] sm:max-w-[430px] md:max-w-[460px]"
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
