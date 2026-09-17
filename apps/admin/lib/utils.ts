export { cn } from "cn"

export function formatDateTime(
  date: string | number | Date | null | undefined,
): string {
  if (!date) return "—"
  return new Date(date).toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  })
}
