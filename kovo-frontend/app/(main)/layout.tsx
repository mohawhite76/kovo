import { Header } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
