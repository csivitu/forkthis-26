console.log("AUTH BASE URL:", process.env.NEXT_PUBLIC_API_URL);
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
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
