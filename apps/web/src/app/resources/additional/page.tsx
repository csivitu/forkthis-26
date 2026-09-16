import type { Metadata } from "next";
import { SectionHeader } from "@/components/resources/section-header";
import { ResourceGrid } from "@/components/resources/resource-card";
import { RESOURCE_SECTIONS } from "@/components/resources/resource-data";

export const metadata: Metadata = {
  title: "Additional Resources",
  description: "Curated Git, GitHub, and open-source learning resources.",
};

const section = (id: string) => {
  const resourceSection = RESOURCE_SECTIONS.find((entry) => entry.id === id);
  if (!resourceSection) {
    throw new Error(`Additional resource section '${id}' is missing`);
  }
  return resourceSection;
};

export default function AdditionalResourcesPage() {
  const youtubeSection = section("youtube");
  const articlesSection = section("articles");
  const githubSection = section("github");

  return (
    <main className="additional-resources">
      <header className="docs-article__header additional-resources__header">
        <p className="docs-article__eyebrow">ForkThis // Docs</p>
        <h1>Additional Resources</h1>
        <p className="docs-article__meta">
          Videos, articles, reference sheets, and repositories for continued
          learning.
        </p>
      </header>

      <section id={youtubeSection.id} className="mb-16 scroll-mt-20 sm:mb-24">
        <SectionHeader title={youtubeSection.title} />
        <ResourceGrid
          items={youtubeSection.items}
          gridClassName="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7 sm:gap-8 lg:gap-10 justify-items-center"
          cardMaxWidthClass="max-w-[280px] sm:max-w-[430px] md:max-w-[460px]"
        />
      </section>

      <section id={articlesSection.id} className="mb-16 scroll-mt-20 sm:mb-24">
        <SectionHeader title={articlesSection.title} />
        <ResourceGrid
          items={articlesSection.items}
          gridClassName="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-7 xl:gap-8 justify-items-center"
          cardMaxWidthClass="max-w-[280px] sm:max-w-[430px] md:max-w-[460px]"
        />
      </section>

      <section id={githubSection.id} className="scroll-mt-20 pb-8">
        <SectionHeader title={githubSection.title} />
        <ResourceGrid
          items={githubSection.items}
          gridClassName="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7 sm:gap-8 lg:gap-10 justify-items-center"
          cardMaxWidthClass="max-w-[280px] sm:max-w-[430px] md:max-w-[460px]"
        />
      </section>
    </main>
  );
}
