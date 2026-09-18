import {
  Children,
  isValidElement,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import ReactMarkdown, {
  type Components,
  type UrlTransform,
} from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { CopyCodeButton } from "./copy-code-button";
import {
  getSafeMarkdownImageUrl,
  getSafeMarkdownLinkUrl,
  isExternalMarkdownLink,
} from "./url-policy";

type SanitizeSchema = NonNullable<Parameters<typeof rehypeSanitize>[0]>;

export interface MarkdownContentProps {
  markdown: string;
  className?: string;
  linkComponent?: Components["a"];
}

export type MarkdownLinkComponent = NonNullable<Components["a"]>;

const appendAttributes = (
  attributes: SanitizeSchema["attributes"],
  element: string,
  additions: NonNullable<SanitizeSchema["attributes"]>[string],
): NonNullable<SanitizeSchema["attributes"]>[string] => [
  ...(attributes?.[element] ?? []),
  ...additions,
];

// Heading IDs are generated before sanitization, so clearing the clobber prefix keeps TOC links exact.
const markdownSanitizeSchema: SanitizeSchema = {
  ...defaultSchema,
  clobberPrefix: "",
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "details",
    "summary",
  ],
  attributes: {
    ...defaultSchema.attributes,
    "*": appendAttributes(defaultSchema.attributes, "*", ["className"]),
    a: appendAttributes(defaultSchema.attributes, "a", [
      "ariaDescribedBy",
      "ariaLabel",
      "href",
      "rel",
      "target",
    ]),
    code: appendAttributes(defaultSchema.attributes, "code", ["className"]),
    details: appendAttributes(defaultSchema.attributes, "details", ["open"]),
    h1: appendAttributes(defaultSchema.attributes, "h1", ["id"]),
    h2: appendAttributes(defaultSchema.attributes, "h2", ["id"]),
    h3: appendAttributes(defaultSchema.attributes, "h3", ["id"]),
    h4: appendAttributes(defaultSchema.attributes, "h4", ["id"]),
    h5: appendAttributes(defaultSchema.attributes, "h5", ["id"]),
    h6: appendAttributes(defaultSchema.attributes, "h6", ["id"]),
    img: appendAttributes(defaultSchema.attributes, "img", [
      "alt",
      "height",
      "loading",
      "src",
      "title",
      "width",
    ]),
    input: appendAttributes(defaultSchema.attributes, "input", [
      ["type", "checkbox"],
      "checked",
      "disabled",
    ]),
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto"],
    src: ["https"],
  },
};

const markdownUrlTransform: UrlTransform = (value, key) =>
  key === "src"
    ? getSafeMarkdownImageUrl(value)
    : getSafeMarkdownLinkUrl(value);

const getNodeText = (node: ReactNode): string => {
  if (
    typeof node === "string" ||
    typeof node === "number" ||
    typeof node === "bigint"
  ) {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getNodeText).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getNodeText(node.props.children);
  }

  return "";
};

const Heading = ({
  level,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { level: number }) => {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return <Tag data-slot="markdown-heading" data-level={level} {...props} />;
};

const markdownComponents: Components = {
  h1: (props) => <Heading level={1} {...props} />,
  h2: (props) => <Heading level={2} {...props} />,
  h3: (props) => <Heading level={3} {...props} />,
  h4: (props) => <Heading level={4} {...props} />,
  h5: (props) => <Heading level={5} {...props} />,
  h6: (props) => <Heading level={6} {...props} />,
  details: (props) => <details data-slot="markdown-details" {...props} />,
  summary: (props) => <summary data-slot="markdown-summary" {...props} />,
  p: (props) => <p data-slot="markdown-paragraph" {...props} />,
  ul: (props) => <ul data-slot="markdown-unordered-list" {...props} />,
  ol: (props) => <ol data-slot="markdown-ordered-list" {...props} />,
  li: (props) => <li data-slot="markdown-list-item" {...props} />,
  blockquote: (props) => (
    <blockquote data-slot="markdown-blockquote" {...props} />
  ),
  table: ({ node: _node, ...props }) => (
    <div data-slot="markdown-table-scroll">
      <table data-slot="markdown-table" {...props} />
    </div>
  ),
  thead: (props) => <thead data-slot="markdown-table-head" {...props} />,
  tbody: (props) => <tbody data-slot="markdown-table-body" {...props} />,
  tr: (props) => <tr data-slot="markdown-table-row" {...props} />,
  th: (props) => <th data-slot="markdown-table-header" {...props} />,
  td: (props) => <td data-slot="markdown-table-cell" {...props} />,
  code: (props) => <code data-slot="markdown-code" {...props} />,
  pre: ({ children, node: _node, ...props }) => {
    const value = getNodeText(Children.toArray(children)).replace(/\n$/, "");

    return (
      <div data-slot="markdown-code-block">
        <CopyCodeButton value={value} />
        <pre data-slot="markdown-pre" {...props}>
          {children}
        </pre>
      </div>
    );
  },
  a: ({ href, node: _node, ...props }) => {
    if (!href) {
      return <span data-slot="markdown-rejected-link">{props.children}</span>;
    }

    const external = isExternalMarkdownLink(href);
    return (
      <a
        data-slot="markdown-link"
        href={href}
        rel={external ? "noopener noreferrer" : undefined}
        target={external ? "_blank" : undefined}
        {...props}
      />
    );
  },
  img: ({ alt, node: _node, src, ...props }) => {
    if (!src) {
      return alt ? (
        <span data-slot="markdown-rejected-image">{alt}</span>
      ) : null;
    }

    return (
      // Markdown images are user-authored remote content, so dimensions are not known at build time.
      <img
        data-slot="markdown-image"
        alt={alt ?? ""}
        loading="lazy"
        src={src}
        {...props}
      />
    );
  },
  hr: (props) => <hr data-slot="markdown-separator" {...props} />,
  section: (props) => <section data-slot="markdown-footnotes" {...props} />,
};

export function MarkdownContent({
  markdown,
  className,
  linkComponent,
}: MarkdownContentProps) {
  return (
    <article data-slot="markdown-content" className={className}>
      <ReactMarkdown
        components={{
          ...markdownComponents,
          a: linkComponent ?? markdownComponents.a,
        }}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          rehypeRaw,
          [rehypeSanitize, markdownSanitizeSchema],
        ]}
        urlTransform={markdownUrlTransform}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
