import type {
  IssueDto,
  MemberDto,
  PointTransactionDto,
  RepositoryDto,
} from "@repo/admin-contracts"
import { ReceiptTextIcon } from "lucide-react"
import { AdjustPointsDialog } from "@/components/adjust-points-dialog"
import { Pager } from "@/components/pager"
import { PageHeader } from "@/components/page-header"
import { FilterBar } from "@/components/search-filter"
import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { apiGet } from "@/lib/api"

interface PointSearch {
  page?: string
  memberId?: string
  issueId?: string
  repositoryId?: string
  reason?: string
  from?: string
  to?: string
}

export default async function PointsPage({
  searchParams,
}: {
  searchParams: Promise<PointSearch>
}) {
  const query = await searchParams
  const params = new URLSearchParams({ page: query.page ?? "1", limit: "25" })
  for (const [key, value] of Object.entries(query))
    if (value && value !== "all" && key !== "page") params.set(key, value)
  const [transactions, members, issues, repositories] = await Promise.all([
    apiGet<PointTransactionDto[]>(`/api/admin/point-transactions?${params}`),
    apiGet<MemberDto[]>("/api/admin/members?page=1&limit=100"),
    apiGet<IssueDto[]>("/api/admin/issues?page=1&limit=100"),
    apiGet<RepositoryDto[]>("/api/admin/repos"),
  ])
  const meta = transactions.meta ?? {
    page: 1,
    limit: 25,
    total: transactions.data.length,
  }
  return (
    <>
      <PageHeader
        title="Points log"
        description="Immutable automatic awards and signed administrator corrections."
        action={
          <AdjustPointsDialog members={members.data} issues={issues.data} />
        }
      />
      <FilterBar>
        <Field>
          <FieldLabel htmlFor="memberId" className="sr-only">
            Member
          </FieldLabel>
          <Select name="memberId" defaultValue={query.memberId ?? "all"}>
            <SelectTrigger id="memberId">
              <SelectValue placeholder="All members" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All members</SelectItem>
                {members.data.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name ?? member.email}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="repositoryId" className="sr-only">
            Repository
          </FieldLabel>
          <Select
            name="repositoryId"
            defaultValue={query.repositoryId ?? "all"}
          >
            <SelectTrigger id="repositoryId">
              <SelectValue placeholder="All repositories" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All repositories</SelectItem>
                {repositories.data.map((repo) => (
                  <SelectItem key={repo.id} value={repo.id}>
                    {repo.owner}/{repo.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="reason" className="sr-only">
            Reason
          </FieldLabel>
          <Select name="reason" defaultValue={query.reason ?? "all"}>
            <SelectTrigger id="reason">
              <SelectValue placeholder="All reasons" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All reasons</SelectItem>
                <SelectItem value="auto_merge">Automatic merge</SelectItem>
                <SelectItem value="admin_manual">Manual</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="from" className="sr-only">
            From date
          </FieldLabel>
          <Input id="from" name="from" type="date" defaultValue={query.from} />
        </Field>
        <Field>
          <FieldLabel htmlFor="to" className="sr-only">
            To date
          </FieldLabel>
          <Input id="to" name="to" type="date" defaultValue={query.to} />
        </Field>
      </FilterBar>
      {transactions.data.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ReceiptTextIcon />
            </EmptyMedia>
            <EmptyTitle>No transactions found</EmptyTitle>
            <EmptyDescription>
              No point entries match these filters.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Repository / issue</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Awarded by</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.data.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.memberName ?? "Detached member"}</TableCell>
                  <TableCell>
                    {entry.repository ?? "Detached repository"}
                    {entry.issueNumber ? ` #${entry.issueNumber}` : ""}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{entry.reason}</Badge>
                  </TableCell>
                  <TableCell className="max-w-64 truncate">
                    {entry.note ?? "—"}
                  </TableCell>
                  <TableCell>{entry.awardedByName ?? "System"}</TableCell>
                  <TableCell>
                    {new Date(entry.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {entry.points > 0 ? "+" : ""}
                    {entry.points}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Pager
        meta={meta}
        path="/points"
        query={{
          memberId: query.memberId,
          issueId: query.issueId,
          repositoryId: query.repositoryId,
          reason: query.reason,
          from: query.from,
          to: query.to,
        }}
      />
    </>
  )
}
