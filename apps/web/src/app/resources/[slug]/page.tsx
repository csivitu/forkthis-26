import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  findNeighbour,
  getMarkdownTableOfContents,
} from "@repo/markdown/server";
import { DocumentationMarkdown } from "@/components/resources/documentation-markdown";
import {
  DocumentationDesktopOutline,
  DocumentationMobileOutline,
} from "@/components/resources/documentation-outline";
import { createResourcePageTree } from "@/lib/resource-tree";
import {
  getPublishedResourceSection,
  getPublishedResourceSections,
} from "@/lib/resources-api";

interface ResourcePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { slug } = await params;
  const section = await getPublishedResourceSection(slug);
  if (!section) return { title: "Resource not found" };
  return {
    title: section.title,
    description: `ForkThis workshop documentation: ${section.title}`,
  };
}

export default async function ResourceSectionPage({
  params,
}: ResourcePageProps) {
  const { slug } = await params;
  const [{ sections }, section] = await Promise.all([
    getPublishedResourceSections(),
    getPublishedResourceSection(slug),
  ]);
  if (!section) notFound();

  const tree = createResourcePageTree(sections);
  const neighbours = findNeighbour(tree, `/resources/${section.slug}`);
  const toc = (await getMarkdownTableOfContents(section.markdown)).filter(
    (item) =>
      (item.depth === 2 || item.depth === 3) &&
      item.title !== "Pre-Workshop Setup Manual",
  );

  return (
    <div className="docs-page-grid">
      <main className="docs-article">
        <header className="docs-article__header">
          <p className="docs-article__eyebrow">ForkThis // Docs</p>
          <h1>{section.title}</h1>
          <p className="docs-article__meta">
            Published{" "}
            {new Date(section.publishedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </header>

        <DocumentationMobileOutline toc={toc} />
        <DocumentationMarkdown markdown={section.markdown} />

        <nav className="docs-pagination" aria-label="Documentation pages">
          {neighbours.previous ? (
            <Link
              href={neighbours.previous.url}
              className="docs-pagination__link"
            >
              <span>Previous</span>
              {neighbours.previous.name}
            </Link>
          ) : (
            <span />
          )}
          {neighbours.next ? (
            <Link
              href={neighbours.next.url}
              className="docs-pagination__link docs-pagination__link--next"
            >
              <span>Next</span>
              {neighbours.next.name}
            </Link>
          ) : null}
        </nav>
      </main>
      <DocumentationDesktopOutline toc={toc} />
    </div>
  );
}
