"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BookOpenCheckIcon,
  DatabaseIcon,
  GaugeIcon,
  LogOutIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"

const navigation = [
  { href: "/overview", label: "Overview", icon: GaugeIcon },
  { href: "/repositories", label: "Repositories", icon: DatabaseIcon },
  { href: "/members", label: "Members", icon: UsersIcon },
  { href: "/participants", label: "Whitelist", icon: BookOpenCheckIcon },
  { href: "/points", label: "Points log", icon: TrophyIcon },
] as const

export function AppSidebar({
  name,
  email,
}: {
  name: string | null
  email: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  async function signOut(): Promise<void> {
    await authClient.signOut()
    router.replace("/login")
    router.refresh()
  }
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="grid size-8 place-items-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
            FT
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium">ForkThis Admin</p>
            <p className="font-mono text-[10px] text-muted-foreground uppercase">
              Admin console
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="min-w-0 px-2 group-data-[collapsible=icon]:hidden">
          <p className="truncate text-xs font-medium">
            {name ?? "Administrator"}
          </p>
          <p className="truncate text-[10px] text-muted-foreground">{email}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOutIcon data-icon="inline-start" />
          Sign out
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
