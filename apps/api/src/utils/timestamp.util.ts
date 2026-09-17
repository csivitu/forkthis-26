const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const IST_OFFSET = "+05:30";

const assertValidTimestamp = (value: string): void => {
  if (Number.isNaN(Date.parse(value))) {
    throw new RangeError(`Invalid timestamp '${value}'`);
  }
};

export const normalizeIstTimestamp = (value: string): string => {
  const normalized = value.replace(" ", "T");
  assertValidTimestamp(normalized);

  if (!normalized.endsWith(IST_OFFSET)) {
    throw new RangeError(
      `Expected timestamp '${value}' to use the ${IST_OFFSET} IST offset`,
    );
  }

  return normalized;
};

export const dateToIstTimestamp = (value: Date): string => {
  if (Number.isNaN(value.getTime())) {
    throw new RangeError(`Invalid Date '${value.toString()}'`);
  }

  const istWallClock = new Date(value.getTime() + IST_OFFSET_MS);
  return istWallClock.toISOString().replace("Z", IST_OFFSET);
};

export const timestampToEpochMillis = (value: string): number => {
  assertValidTimestamp(value);
  return Date.parse(value);
};
