"use client"

type DateTimeProps = {
  value: string | Date | null | undefined
}

export function DateTime({ value }: DateTimeProps) {
  if (!value) return <>—</>

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return <>—</>

  return (
    <time dateTime={date.toISOString()}>
      {new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)}
    </time>
  )
}