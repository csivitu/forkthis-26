const ALLOWED_LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

const hasExplicitScheme = (value: string): boolean =>
  /^[a-z][a-z\d+.-]*:/i.test(value);

const isSiteRelativeUrl = (value: string): boolean =>
  value.startsWith("/") && !value.startsWith("//");

const isDocumentRelativeUrl = (value: string): boolean =>
  !value.startsWith("//") && !value.includes("\\") && !hasExplicitScheme(value);

const hasUnsafeCharacters = (value: string): boolean =>
  /[\u0000-\u001F\u007F]/.test(value);

export const getSafeMarkdownLinkUrl = (value: string): string | null => {
  const normalized = value.trim();

  if (normalized.length === 0 || hasUnsafeCharacters(normalized)) {
    return null;
  }

  if (isSiteRelativeUrl(normalized) || isDocumentRelativeUrl(normalized)) {
    return normalized;
  }

  if (!URL.canParse(normalized)) {
    return null;
  }

  const url = new URL(normalized);
  return ALLOWED_LINK_PROTOCOLS.has(url.protocol) ? normalized : null;
};

export const getSafeMarkdownImageUrl = (value: string): string | null => {
  const normalized = value.trim();

  if (normalized.length === 0 || hasUnsafeCharacters(normalized)) {
    return null;
  }

  if (isSiteRelativeUrl(normalized)) {
    return normalized;
  }

  if (!URL.canParse(normalized)) {
    return null;
  }

  const url = new URL(normalized);
  return url.protocol === "https:" ? normalized : null;
};

export const isExternalMarkdownLink = (value: string): boolean => {
  if (!URL.canParse(value)) {
    return false;
  }

  const url = new URL(value);
  return url.protocol === "http:" || url.protocol === "https:";
};
