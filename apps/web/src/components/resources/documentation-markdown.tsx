import Link from "next/link";
import {
  MarkdownContent,
  type MarkdownLinkComponent,
} from "@repo/markdown/content";
import { isExternalMarkdownLink } from "@repo/markdown";

const DocumentationLink: MarkdownLinkComponent = (properties) => {
  const { href, node, ...props } = properties;
  void node;
  if (!href) {
    return <span data-slot="markdown-rejected-link">{props.children}</span>;
  }
  if (isExternalMarkdownLink(href)) {
    return (
      <a href={href} rel="noopener noreferrer" target="_blank" {...props} />
    );
  }
  if (href.startsWith("mailto:")) {
    return <a href={href} {...props} />;
  }
  return <Link href={href} {...props} />;
};

export function DocumentationMarkdown({ markdown }: { markdown: string }) {
  return (
    <MarkdownContent
      markdown={markdown}
      className="docs-markdown"
      linkComponent={DocumentationLink}
    />
  );
}
