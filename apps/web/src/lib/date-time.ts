const istDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export const formatIstDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Invalid IST timestamp '${value}'`);
  }
  return istDateFormatter.format(date);
};
