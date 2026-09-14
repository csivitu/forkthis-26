import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

export default function RepositoryNotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Repository not found</EmptyTitle>
        <EmptyDescription>
          The repository may have been permanently deleted.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/repositories">Return to repositories</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
