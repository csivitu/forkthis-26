import type { ReactNode } from "react";
import { ResourceNavigation } from "@/components/resources/resource-navigation";
import { createResourcePageTree } from "@/lib/resource-tree";
import { getPublishedResourceSections } from "@/lib/resources-api";

export default async function ResourcesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { sections } = await getPublishedResourceSections();
  const tree = createResourcePageTree(sections);
  const items = tree.children.map((node) => {
    if (node.type !== "page" || typeof node.name !== "string") {
      throw new Error("Resource page tree must contain flat, named page nodes");
    }
    return { name: node.name, url: node.url };
  });

  return (
    <div className="docs-shell">
      <div className="docs-shell__frame" aria-hidden="true" />
      <div className="docs-shell__grid">
        <ResourceNavigation items={items} />
        <div className="docs-shell__content">{children}</div>
      </div>
    </div>
  );
}
