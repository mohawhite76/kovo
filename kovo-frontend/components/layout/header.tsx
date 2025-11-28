"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, PlusCircle, Car, MessageSquare, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)

  const navItems = [
    { href: "/", label: "Rechercher", icon: Search },
    { href: "/trips/new", label: "Publier", icon: PlusCircle },
    { href: "/my-trips", label: "Vos trajets", icon: Car },
    { href: "/messages", label: "Messages", icon: MessageSquare },
  ]

  return (
    <header className="hidden lg:block sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
            Kovo
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href))
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="rounded-lg">
                  <Settings className="size-5" />
                </Button>
              </Link>
              <Link href="/profile">
                <Avatar className="size-9 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarImage src={user.avatar} alt={user.first_name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                    {user.first_name[0]}{user.last_name[0]}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          )}

          {!user && (
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="rounded-lg">
                <Link href="/login">Connexion</Link>
              </Button>
              <Button asChild className="rounded-lg">
                <Link href="/register">Inscription</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
