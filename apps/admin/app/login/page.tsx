import { ShieldCheckIcon } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SignInButton } from "@/components/sign-in-button"

export default function LoginPage() {
  return (
    <main className="grid min-h-svh place-items-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <ShieldCheckIcon className="mb-3 text-primary" />
          <CardTitle>Admin Console Access</CardTitle>
          <CardDescription>
            Sign in with the Google account assigned an administrator role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInButton />
        </CardContent>
      </Card>
    </main>
  )
}
