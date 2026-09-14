import { createAuthClient } from "better-auth/react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is required");

export const authClient = createAuthClient({
  baseURL: `${apiUrl}/api/auth`,
});

export async function signInWithGoogle() {
  const { error } = await authClient.signIn.social({
    provider: "google",
    callbackURL: `${window.location.origin}/auth/link-github`,
  });

  if (error) {
    throw new Error(error.message ?? "Google sign-in failed.");
  }
}
