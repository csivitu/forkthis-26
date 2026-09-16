import type { PublishedResourceSectionSummaryDto } from "@repo/resource-contracts";
import type {
  MarkdownPageTreeItem,
  MarkdownPageTreeRoot,
} from "@repo/markdown/server";

export const ADDITIONAL_RESOURCES_NODE: MarkdownPageTreeItem = {
  $id: "additional-resources",
  type: "page",
  name: "Additional Resources",
  url: "/resources/additional",
};

export const createResourcePageTree = (
  sections: PublishedResourceSectionSummaryDto[],
): MarkdownPageTreeRoot => ({
  $id: "forkthis-resources",
  type: "root",
  name: "Workshop Documentation",
  children: [
    ...sections.map<MarkdownPageTreeItem>((section) => ({
      $id: section.id,
      type: "page",
      name: section.title,
      url: `/resources/${section.slug}`,
    })),
    ADDITIONAL_RESOURCES_NODE,
  ],
});
