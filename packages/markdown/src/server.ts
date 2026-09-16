import { getTableOfContents } from "fumadocs-core/content/toc";
import { structure, type StructuredData } from "fumadocs-core/mdx-plugins";
import type { TOCItemType } from "fumadocs-core/toc";
import remarkGfm from "remark-gfm";

export { findNeighbour } from "fumadocs-core/page-tree";
export type {
  Item as MarkdownPageTreeItem,
  Root as MarkdownPageTreeRoot,
} from "fumadocs-core/page-tree";

export const getMarkdownTableOfContents = (
  markdown: string,
): Promise<TOCItemType[]> => getTableOfContents(markdown, [remarkGfm]);

export const getMarkdownStructuredData = (markdown: string): StructuredData =>
  structure(markdown, [remarkGfm]);
