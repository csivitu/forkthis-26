"use client"

import { useTransition } from "react"
import type { IssueDto } from "@repo/admin-contracts"
import { toast } from "sonner"
import { updateIssuePointsAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function IssuePointsDialog({ issue }: { issue: IssueDto }) {
  const [pending, startTransition] = useTransition()
  const submit = (formData: FormData): void =>
    startTransition(async () => {
      const result = await updateIssuePointsAction(issue.id, formData)
      result.success
        ? toast.success(result.message)
        : toast.error(result.message)
    })
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit points
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Issue #{issue.githubIssueNumber} base points
          </DialogTitle>
          <DialogDescription>
            Title, difficulty, and status remain owned by GitHub
            synchronization.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="flex flex-col gap-5">
          <Field>
            <FieldLabel htmlFor={`points-${issue.id}`}>Base points</FieldLabel>
            <Input
              id={`points-${issue.id}`}
              name="points"
              type="number"
              min="0"
              required
              defaultValue={issue.points}
            />
          </Field>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save points"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
