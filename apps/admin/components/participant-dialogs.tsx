"use client"

import { useTransition } from "react"
import { FileUpIcon, UserPlusIcon } from "lucide-react"
import { toast } from "sonner"
import {
  createParticipantAction,
  uploadParticipantsAction,
} from "@/app/actions"
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

function MutationDialog({ mode }: { mode: "single" | "csv" }) {
  const [pending, startTransition] = useTransition()
  const submit = (formData: FormData): void =>
    startTransition(async () => {
      const result =
        mode === "single"
          ? await createParticipantAction(formData)
          : await uploadParticipantsAction(formData)
      result.success
        ? toast.success(result.message)
        : toast.error(result.message)
    })
  const single = mode === "single"
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={single ? "default" : "outline"}>
          {single ? (
            <UserPlusIcon data-icon="inline-start" />
          ) : (
            <FileUpIcon data-icon="inline-start" />
          )}
          {single ? "Add to whitelist" : "Import CSV"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {single ? "Add to whitelist" : "Import whitelist"}
          </DialogTitle>
          <DialogDescription>The whitelist is append-only.</DialogDescription>
        </DialogHeader>
        <form action={submit} className="flex flex-col gap-5">
          <Field>
            <FieldLabel htmlFor={single ? "regno" : "file"}>
              {single ? "Registration number" : "CSV file"}
            </FieldLabel>
            <Input
              id={single ? "regno" : "file"}
              name={single ? "regno" : "file"}
              type={single ? "text" : "file"}
              accept={single ? undefined : ".csv,text/csv"}
              required
            />
          </Field>
          <Button type="submit" disabled={pending}>
            {pending
              ? "Processing…"
              : single
                ? "Add to whitelist"
                : "Import whitelist"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ParticipantActions() {
  return (
    <div className="flex gap-2">
      <MutationDialog mode="csv" />
      <MutationDialog mode="single" />
    </div>
  )
}
