import { redirect } from "next/navigation";
import { getPublishedResourceSections } from "@/lib/resources-api";

export default async function ResourcesPage() {
  const { sections } = await getPublishedResourceSections();
  redirect(
    sections[0] ? `/resources/${sections[0].slug}` : "/resources/additional",
  );
}
