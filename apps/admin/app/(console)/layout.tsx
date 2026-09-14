import { redirect } from "next/navigation"
import { ShieldXIcon } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession } from "@/lib/api"
import { resolveConsoleAccess } from "@/lib/access"

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const access = resolveConsoleAccess(await getSession())
  if (access.state === "unauthenticated") redirect("/login")
  if (access.state === "denied")
    return (
      <main className="grid min-h-svh place-items-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <ShieldXIcon className="mb-3 text-destructive" />
            <CardTitle>Access denied</CardTitle>
            <CardDescription>
              This console is restricted to ForkThis&apos;26 administrators.
            </CardDescription>
          </CardHeader>
          <CardContent className="font-mono text-xs text-muted-foreground">
            Signed in as {access.user.email}
          </CardContent>
        </Card>
      </main>
    )
  return (
    <SidebarProvider>
      <AppSidebar name={access.user.name} email={access.user.email} />
      <SidebarInset>
        <header className="sticky top-0 flex h-14 items-center border-b bg-background/90 px-4 backdrop-blur">
          <SidebarTrigger />
          <span className="ml-3 font-mono text-xs tracking-wider text-muted-foreground uppercase">
            ForkThis Admin
          </span>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
