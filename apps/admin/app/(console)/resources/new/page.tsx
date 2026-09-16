import { PageHeader } from "@/components/page-header"
import { ResourceEditor } from "@/components/resource-editor"

export default function NewResourcePage() {
  return (
    <>
      <PageHeader
        title="New resource section"
        description="Create a private draft. Publishing remains a separate action."
      />
      <ResourceEditor section={null} />
    </>
  )
}
