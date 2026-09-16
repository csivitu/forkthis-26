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
import { PointsFilterBar } from "@/components/points-filter-bar"
import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
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
  memberSearch?: string
  issueId?: string
  repositoryId?: string
  sort?: string
}

export default async function PointsPage({
  searchParams,
}: {
  searchParams: Promise<PointSearch>
}) {
  const query = await searchParams
  const params = new URLSearchParams({ page: query.page ?? "1", limit: "25" })
  if (query.memberSearch) params.set("memberSearch", query.memberSearch)
  if (query.repositoryId && query.repositoryId !== "all")
    params.set("repositoryId", query.repositoryId)
  if (query.sort && query.sort !== "newest") params.set("sort", query.sort)

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
      <PointsFilterBar
        members={members.data}
        repositories={repositories.data}
        defaults={{
          memberSearch: query.memberSearch,
          repositoryId: query.repositoryId,
          sort: query.sort,
        }}
      />
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
          memberSearch: query.memberSearch,
          repositoryId: query.repositoryId,
          sort: query.sort,
        }}
      />
    </>
  )
}
