const REGNO_LENGTH = 9;

export function extractRegNo(displayName: string | null | undefined): string | null {
  if (!displayName) return null;
  const compact = displayName.replace(/\s+/g, "");
  if (compact.length < REGNO_LENGTH) return null;
  return compact.slice(-REGNO_LENGTH).toUpperCase();
}