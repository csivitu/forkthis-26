"use client"

import { useTransition } from "react"
import { RefreshCwIcon } from "lucide-react"
import { toast } from "sonner"
import { syncRepositoriesAction } from "@/app/actions"
import { Button } from "@/components/ui/button"

export function SyncButton() {
  const [pending, startTransition] = useTransition()
  return (
    <Button disabled={pending} onClick={() => startTransition(async () => {
      const result = await syncRepositoriesAction()
      if (result.success) toast.success(result.message)
      else toast.error(result.message)
    })}>
      <RefreshCwIcon data-icon="inline-start" />
      {pending ? "Starting sync…" : "Sync now"}
    </Button>
  )
}
