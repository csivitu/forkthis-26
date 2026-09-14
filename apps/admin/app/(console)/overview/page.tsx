import Link from "next/link"
import type { OverviewStatsDto, SyncLogDto } from "@repo/admin-contracts"
import { AlertTriangleIcon, ArrowUpRightIcon } from "lucide-react"
import { OverviewCharts } from "@/components/overview-charts"
import { PageHeader } from "@/components/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { apiGet } from "@/lib/api"

export default async function OverviewPage() {
  const [statsResponse, failuresResponse] = await Promise.all([
    apiGet<OverviewStatsDto>("/api/admin/stats/overview"),
    apiGet<SyncLogDto[]>("/api/admin/sync-logs?status=failed&limit=5&page=1"),
  ])
  const stats = statsResponse.data
  const linkRate =
    stats.totalUsers === 0
      ? 0
      : Math.round((stats.linkedGithubUsers / stats.totalUsers) * 100)
  const metrics = [
    {
      label: "Members",
      value: stats.totalUsers,
      detail: `${linkRate}% GitHub linked`,
    },
    {
      label: "Repositories",
      value: stats.totalRepositories,
      detail: `${stats.activeRepositories} active`,
    },
    {
      label: "Issues",
      value: stats.totalIssues,
      detail: `${stats.openIssues} open`,
    },
    {
      label: "Awarded points",
      value: stats.totalPointsAwarded,
      detail: "Net points total",
    },
  ]
  return (
    <>
      <PageHeader
        title="Overview"
        description="Operational health across members, repositories, synchronization, and scoring."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader>
              <CardDescription className="font-mono tracking-wider uppercase">
                {metric.label}
              </CardDescription>
              <CardTitle className="text-3xl">
                {metric.value.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {metric.detail}
            </CardContent>
          </Card>
        ))}
      </div>
      <OverviewCharts stats={stats} />
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Recent sync failures</CardTitle>
            <CardDescription>
              Latest failed scheduled repository polls.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/repositories">
              <ArrowUpRightIcon data-icon="inline-end" />
              Repositories
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {failuresResponse.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent failures.</p>
          ) : (
            failuresResponse.data.map((failure) => (
              <Alert key={failure.id} variant="destructive">
                <AlertTriangleIcon />
                <AlertTitle>{failure.repository}</AlertTitle>
                <AlertDescription>
                  {failure.errorMessage ??
                    "Sync failed without a recorded message"}
                </AlertDescription>
              </Alert>
            ))
          )}
        </CardContent>
      </Card>
    </>
  )
}
