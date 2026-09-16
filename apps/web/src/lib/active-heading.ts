export interface HeadingPosition {
  url: string;
  top: number;
}

export function findActiveHeadingUrl(
  headings: HeadingPosition[],
  topOffset: number,
  atPageEnd: boolean,
): string | null {
  if (headings.length === 0) return null;
  if (atPageEnd) return headings.at(-1)?.url ?? null;

  let activeUrl = headings[0].url;
  for (const heading of headings) {
    if (heading.top > topOffset) break;
    activeUrl = heading.url;
  }

  return activeUrl;
}
