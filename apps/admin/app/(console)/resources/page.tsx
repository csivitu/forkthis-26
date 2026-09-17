import Link from "next/link"
import type {
  ResourcePublicationStatus,
  ResourceSectionSummaryDto,
} from "@repo/resource-contracts"
import { BookOpenTextIcon, PlusIcon } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import {
  ResourceLifecycleActions,
  ResourceReorderControls,
} from "@/components/resource-section-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { formatIstDateTime } from "@/lib/date-time"

const statusVariant = (
  status: ResourcePublicationStatus
): "default" | "secondary" | "outline" => {
  if (status === "published") return "default"
  if (status === "modified") return "outline"
  return "secondary"
}

export default async function ResourcesPage() {
  const { data } = await apiGet<ResourceSectionSummaryDto[]>(
    "/api/admin/resource-sections"
  )
  const orderedIds = data.map((section) => section.id)

  return (
    <>
      <PageHeader
        title="Resources"
        description="Write workshop documentation as drafts, then publish stable participant pages."
        action={
          <Button asChild>
            <Link href="/resources/new">
              <PlusIcon data-icon="inline-start" />
              New section
            </Link>
          </Button>
        }
      />
      {data.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpenTextIcon />
            </EmptyMedia>
            <EmptyTitle>No documentation sections</EmptyTitle>
            <EmptyDescription>
              Create a draft and publish it when participants should see it.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link href="/resources/new">Create first section</Link>
          </Button>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Order</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((section, index) => (
                <TableRow key={section.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-center font-mono text-xs text-muted-foreground">
                        {index + 1}
                      </span>
                      <ResourceReorderControls
                        section={section}
                        orderedIds={orderedIds}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/resources/${section.id}`}
                      className="font-medium hover:underline"
                    >
                      {section.title}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">
                      /{section.slug}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(section.publicationStatus)}>
                      {section.publicationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                    {formatIstDateTime(section.updatedAt)}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                    {section.publishedAt
                      ? formatIstDateTime(section.publishedAt)
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/resources/${section.id}`}>Edit</Link>
                      </Button>
                      <ResourceLifecycleActions section={section} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
