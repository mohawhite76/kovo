"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MessageSquare, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { messageAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/store"

export default function MessagesPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchConversations()
  }, [user, router])

  if (!user) {
    return null
  }

  const fetchConversations = async () => {
    try {
      const { data } = await messageAPI.getConversations()
      setConversations(data.conversations)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-2xl w-1/3" />
          <div className="h-96 bg-muted rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="space-y-4 mb-6">
        <h1 className="text-4xl md:text-5xl font-bold">Messages</h1>
        <p className="text-lg text-muted-foreground">Discutez avec vos covoitureurs</p>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
        {conversations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="size-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Aucune conversation</h2>
            <p className="text-muted-foreground mb-6">
              Réservez un trajet pour commencer à discuter avec d'autres étudiants
            </p>
            <Button asChild className="h-12 px-6">
              <Link href="/">Rechercher un trajet</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conv: any) => (
              <Link
                key={conv.user.id}
                href={`/messages/${conv.user.id}`}
                className="group block p-5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="size-12 ring-2 ring-primary/10">
                    <AvatarImage src={conv.user.avatar} alt={conv.user.first_name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {conv.user.first_name[0]}{conv.user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold truncate">
                        {conv.user.first_name} {conv.user.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {new Date(conv.lastMessage.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {conv.lastMessage.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
