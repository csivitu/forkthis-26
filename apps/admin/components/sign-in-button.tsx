"use client"

import { useState } from "react"
import { LoaderCircleIcon, LogInIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { signInWithGoogle } from "@/lib/auth-client"

export function SignInButton() {
  const [pending, setPending] = useState(false)
  async function signIn(): Promise<void> {
    setPending(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Google sign-in failed"
      )
      setPending(false)
    }
  }
  return (
    <Button onClick={signIn} disabled={pending}>
      {pending ? (
        <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
      ) : (
        <LogInIcon data-icon="inline-start" />
      )}
      Continue with Google
    </Button>
  )
}
