import type { ResourceSectionAdminDto } from "@repo/resource-contracts"
import { PageHeader } from "@/components/page-header"
import { ResourceEditor } from "@/components/resource-editor"
import { apiGet } from "@/lib/api"

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data } = await apiGet<ResourceSectionAdminDto>(
    `/api/admin/resource-sections/${id}`
  )

  return (
    <>
      <PageHeader
        title={data.title}
        description="Edit the draft locally, then republish when participants should receive the changes."
      />
      <ResourceEditor section={data} />
    </>
  )
}
