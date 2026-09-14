"use client"

import type { OverviewStatsDto } from "@repo/admin-contracts"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const difficultyConfig = {
  issues: { label: "Issues", color: "var(--chart-1)" },
} satisfies ChartConfig
const mergeConfig = {
  value: { label: "Pull requests" },
  merged: { label: "Merged", color: "var(--chart-1)" },
  remaining: { label: "Not merged", color: "var(--chart-2)" },
} satisfies ChartConfig

export function OverviewCharts({ stats }: { stats: OverviewStatsDto }) {
  const difficulty = Object.entries(stats.issuesByDifficulty).map(
    ([name, issues]) => ({ name, issues })
  )
  const merge = [
    {
      name: "merged",
      value: stats.mergedPullRequests,
      fill: "var(--color-merged)",
    },
    {
      name: "remaining",
      value: Math.max(0, stats.totalPullRequests - stats.mergedPullRequests),
      fill: "var(--color-remaining)",
    },
  ]
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Issue distribution</CardTitle>
          <CardDescription>
            Current synchronized workload by difficulty.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={difficultyConfig} className="h-56 w-full">
            <BarChart data={difficulty}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="issues" fill="var(--color-issues)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Merge rate</CardTitle>
          <CardDescription>
            {stats.totalPullRequests === 0
              ? "No pull requests synchronized"
              : `${Math.round((stats.mergedPullRequests / stats.totalPullRequests) * 100)}% merged`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={mergeConfig} className="mx-auto h-56">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={merge} dataKey="value" nameKey="name" innerRadius={55}>
                {merge.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
