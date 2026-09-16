"use client"

import { useState, useTransition } from "react"
import type { IssueDto, MemberDto } from "@repo/admin-contracts"
import { CirclePlusIcon } from "lucide-react"
import { toast } from "sonner"
import { adjustPointsAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TableCell, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

function AdjustmentFields({ issues }: { issues: IssueDto[] }) {
  const [repositoryId, setRepositoryId] = useState("")
  const repositories = Array.from(
    new Map(issues.map((issue) => [issue.repositoryId, issue.repository])),
  )
  const repoIssues = issues.filter((issue) => issue.repositoryId === repositoryId)

  return (
    <>
      <Field>
        <FieldLabel htmlFor="repositoryId">Repository</FieldLabel>
        <Select value={repositoryId} onValueChange={setRepositoryId} required>
          <SelectTrigger id="repositoryId">
            <SelectValue placeholder="Select repository" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {repositories.map(([id, label]) => (
                <SelectItem key={id} value={id}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="issueId">Issue</FieldLabel>
        <Select
          key={repositoryId}
          name="issueId"
          required
          disabled={!repositoryId}
        >
          <SelectTrigger id="issueId">
            <SelectValue
              placeholder={repositoryId ? "Select issue" : "Select a repository first"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {repoIssues.map((issue) => (
                <SelectItem key={issue.id} value={issue.id}>
                  #{issue.githubIssueNumber} · {issue.title}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="points">Signed points</FieldLabel>
        <Input id="points" name="points" type="number" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="note">Reason</FieldLabel>
        <Textarea
          id="note"
          name="note"
          minLength={3}
          maxLength={500}
          required
        />
      </Field>
    </>
  )
}

function usePointAdjustment(onSuccess: () => void): {
  pending: boolean
  submit: (formData: FormData) => void
} {
  const [pending, startTransition] = useTransition()
  const submit = (formData: FormData): void =>
    startTransition(async () => {
      const result = await adjustPointsAction(formData)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      onSuccess()
    })
  return { pending, submit }
}

export function AdjustPointsDialog({
  members,
  issues,
}: {
  members: MemberDto[]
  issues: IssueDto[]
}) {
  const { pending, submit } = usePointAdjustment(() => undefined)
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <CirclePlusIcon data-icon="inline-start" />
          Adjust points
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manual point adjustment</DialogTitle>
          <DialogDescription>
            Use a positive award or negative correction. Every adjustment
            requires an audit note.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="flex flex-col gap-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="userId">Member</FieldLabel>
              <Select name="userId" required>
                <SelectTrigger id="userId">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name ?? member.email}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <AdjustmentFields issues={issues} />
          </FieldGroup>
          <Button type="submit" disabled={pending}>
            {pending ? "Recording…" : "Record adjustment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function MemberPointsDialog({
  member,
  issues,
}: {
  member: MemberDto
  issues: IssueDto[]
}) {
  const [open, setOpen] = useState(false)
  const { pending, submit } = usePointAdjustment(() => setOpen(false))
  const label = member.name ?? member.email
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TableRow
          className="cursor-pointer"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return
            event.preventDefault()
            setOpen(true)
          }}
        >
          <TableCell>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={member.avatarUrl ?? undefined} alt="" />
                <AvatarFallback>
                  {label.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{member.name ?? "Unnamed member"}</span>
            </div>
          </TableCell>
          <TableCell>{member.email}</TableCell>
          <TableCell className="font-mono text-xs">
            {member.githubUsername ?? "Not linked"}
          </TableCell>
          <TableCell className="text-right font-mono">
            {member.totalPoints}
          </TableCell>
        </TableRow>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust points for {label}</DialogTitle>
          <DialogDescription>
            Use a positive award or negative correction. Every adjustment
            requires an audit note.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="flex flex-col gap-5">
          <input type="hidden" name="userId" value={member.id} />
          <FieldGroup>
            <AdjustmentFields issues={issues} />
          </FieldGroup>
          <Button type="submit" disabled={pending}>
            {pending ? "Recording…" : "Record adjustment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
