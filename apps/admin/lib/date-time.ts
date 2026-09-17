const istDateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  timeZone: "Asia/Kolkata",
  timeZoneName: "short",
})

export const formatIstDateTime = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Invalid IST timestamp '${value}'`)
  }
  return istDateTimeFormatter.format(date)
}
