const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const IST_OFFSET = "+05:30";

export const dateToIstTimestamp = (value: Date): string => {
  if (Number.isNaN(value.getTime())) {
    throw new RangeError(`Invalid Date '${value.toString()}'`);
  }

  const istWallClock = new Date(value.getTime() + IST_OFFSET_MS);
  return istWallClock.toISOString().replace("Z", IST_OFFSET);
};
