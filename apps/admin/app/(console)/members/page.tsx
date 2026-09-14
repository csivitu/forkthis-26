import type { IssueDto, MemberDto } from "@repo/admin-contracts"
import { UserRoundSearchIcon } from "lucide-react"
import { MemberPointsDialog } from "@/components/adjust-points-dialog"
import { Pager } from "@/components/pager"
import { PageHeader } from "@/components/page-header"
import { DebouncedSearch } from "@/components/search-filter"
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

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const query = await searchParams
  const params = new URLSearchParams({ page: query.page ?? "1", limit: "25" })
  if (query.search) params.set("search", query.search)
  const [response, issues] = await Promise.all([
    apiGet<MemberDto[]>(`/api/admin/members?${params}`),
    apiGet<IssueDto[]>("/api/admin/issues?page=1&limit=100"),
  ])
  const meta = response.meta ?? {
    page: 1,
    limit: 25,
    total: response.data.length,
  }
  return (
    <>
      <PageHeader
        title="Members"
        description="Search registered accounts by name, email, or GitHub username."
      />
      <DebouncedSearch
        placeholder="Name, email, or GitHub username"
        defaultValue={query.search}
      />
      {response.data.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserRoundSearchIcon />
            </EmptyMedia>
            <EmptyTitle>No members found</EmptyTitle>
            <EmptyDescription>Try a broader search term.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>GitHub</TableHead>
                <TableHead className="text-right">Total points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {response.data.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <MemberPointsDialog member={member} issues={issues.data} />
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {member.githubUsername ?? "Not linked"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {member.totalPoints}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Pager meta={meta} path="/members" query={{ search: query.search }} />
    </>
  )
}
