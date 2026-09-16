import "server-only";
import type {
  PublishedResourceSectionDto,
  PublishedResourceSectionListDto,
} from "@repo/resource-contracts";
import { headers } from "next/headers";

interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

const apiOrigin = (): string => {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!configured) {
    throw new Error("NEXT_PUBLIC_API_URL is required to load resources");
  }
  return configured;
};

async function resourceRequest<T>(path: string): Promise<T | null> {
  const cookie = (await headers()).get("cookie");
  const response = await fetch(`${apiOrigin()}${path}`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  const payload = (await response.json()) as ApiResponse<T>;

  if (response.status === 404) return null;
  if (!response.ok || !payload.success) {
    const context = payload.success
      ? `HTTP_${response.status}`
      : `${payload.error.code}: ${payload.error.message}`;
    throw new Error(`Resource request '${path}' failed: ${context}`);
  }
  return payload.data;
}

export async function getPublishedResourceSections(): Promise<PublishedResourceSectionListDto> {
  const sections = await resourceRequest<PublishedResourceSectionListDto>(
    "/api/resources/sections",
  );
  if (!sections) {
    throw new Error("Published resource section list was not found");
  }
  return sections;
}

export const getPublishedResourceSection = (
  slug: string,
): Promise<PublishedResourceSectionDto | null> =>
  resourceRequest<PublishedResourceSectionDto>(
    `/api/resources/sections/${encodeURIComponent(slug)}`,
  );
