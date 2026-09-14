"use client"

import { AlertCircleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>Console data unavailable</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-3">
        <span>{error.message}</span>
        <Button variant="outline" size="sm" onClick={reset}>
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  )
}
