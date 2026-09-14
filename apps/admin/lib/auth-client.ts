"use client"

import { createAuthClient } from "better-auth/react"

const apiUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "")

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL ?? `${apiUrl}/api/auth`,
})

export async function signInWithGoogle(): Promise<void> {
  const { error } = await authClient.signIn.social({
    provider: "google",
    callbackURL: window.location.origin,
  })
  if (error) throw new Error(error.message ?? "Google sign-in failed")
}
