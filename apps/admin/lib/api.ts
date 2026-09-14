import type { ApiResponse, ApiSuccess } from "@repo/admin-contracts"
import { headers } from "next/headers"

const apiUrl =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000"

export async function apiRequest<T>(
  path: string,
  init: RequestInit
): Promise<ApiSuccess<T>> {
  const incoming = await headers()
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: { cookie: incoming.get("cookie") ?? "", ...init.headers },
  })
  const payload = (await response.json()) as ApiResponse<T>
  if (!response.ok || !payload.success) {
    if (!payload.success)
      throw new Error(`${payload.error.code}: ${payload.error.message}`)
    throw new Error(`API request failed with status ${response.status}`)
  }
  return payload
}

export const apiGet = <T>(path: string): Promise<ApiSuccess<T>> =>
  apiRequest<T>(path, { method: "GET" })

export interface SessionUser {
  id: string
  name: string | null
  email: string
  image?: string | null
  role?: string
}

export async function getSession(): Promise<{ user: SessionUser } | null> {
  const incoming = await headers()
  const response = await fetch(`${apiUrl}/api/auth/get-session`, {
    headers: { cookie: incoming.get("cookie") ?? "" },
    cache: "no-store",
  })
  if (!response.ok)
    throw new Error(`Session lookup failed with status ${response.status}`)
  return (await response.json()) as { user: SessionUser } | null
}
