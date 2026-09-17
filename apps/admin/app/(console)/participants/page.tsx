import type { ParticipantDto } from "@repo/admin-contracts"
import { ContactRoundIcon } from "lucide-react"
import { Pager } from "@/components/pager"
import { PageHeader } from "@/components/page-header"
import { ParticipantActions } from "@/components/participant-dialogs"
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
import { formatDateTime } from "@/lib/utils"

export default async function ParticipantsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const query = await searchParams
  const params = new URLSearchParams({ page: query.page ?? "1", limit: "25" })
  if (query.search) params.set("search", query.search)
  const response = await apiGet<ParticipantDto[]>(
    `/api/admin/participants?${params}`
  )
  const meta = response.meta ?? {
    page: 1,
    limit: 25,
    total: response.data.length,
  }
  return (
    <>
      <PageHeader
        title="Whitelist"
        description="Append-only email eligibility list."
        action={<ParticipantActions />}
      />
      <DebouncedSearch
        placeholder="Email address"
        defaultValue={query.search}
      />
      {response.data.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ContactRoundIcon />
            </EmptyMedia>
            <EmptyTitle>No whitelist entries found</EmptyTitle>
            <EmptyDescription>
              Add one email address or import a CSV list.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Email address</TableHead>
                <TableHead>Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {response.data.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-mono font-medium">
                    {participant.email}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(participant.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Pager
        meta={meta}
        path="/participants"
        query={{ search: query.search }}
      />
    </>
  )
}
