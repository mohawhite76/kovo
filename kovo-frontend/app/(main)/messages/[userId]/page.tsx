"use client"

import { useState, useEffect, useRef } from "react"
import { Send, ArrowLeft, Smile } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { messageAPI, tripAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { formatDate } from "@/lib/utils"

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

export default function ConversationPage({ params }: { params: { userId: string } }) {
  const user = useAuthStore((state) => state.user)
  const searchParams = useSearchParams()
  const tripId = searchParams.get('trip')
  const [otherUser, setOtherUser] = useState<any>(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const tripMessageSentRef = useRef(false)

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [params.userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  useEffect(() => {
    const sendTripContextMessage = async () => {
      if (tripId && messages.length === 0 && !tripMessageSentRef.current && !loading) {
        tripMessageSentRef.current = true
        try {
          const { data } = await tripAPI.getTripById(tripId)
          const trip = data.trip
          const contextMessage = `📍 Concerne le trajet: ${trip.departure} → ${trip.destination}\n📅 ${formatDate(trip.date_time)}\n💰 ${trip.price}€`

          await messageAPI.sendMessage({
            recipientId: params.userId,
            content: contextMessage
          })

          fetchMessages()
        } catch (error) {
          console.error('Error sending trip context message:', error)
          tripMessageSentRef.current = false
        }
      }
    }
    sendTripContextMessage()
  }, [tripId, messages.length, loading])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleEmojiClick = (emojiData: any) => {
    setNewMessage(prev => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  const fetchMessages = async () => {
    try {
      const { data } = await messageAPI.getConversationWith(params.userId)
      setOtherUser(data.user)
      setMessages(data.messages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSending(true)
    try {
      await messageAPI.sendMessage({
        recipientId: params.userId,
        content: newMessage.trim()
      })
      setNewMessage("")
      fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
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

  if (!otherUser) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="bg-card rounded-2xl shadow-sm border p-12 text-center">
          <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😕</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Utilisateur non trouvé</h2>
          <p className="text-muted-foreground mb-6">Cette conversation n'existe pas ou plus</p>
          <Button asChild className="h-12 px-6">
            <Link href="/messages">Retour aux messages</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/messages">
            <ArrowLeft className="size-4 mr-2" />
            Retour
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
        <div className="flex flex-col h-[600px]">
          <div className="p-5 border-b flex items-center gap-4 bg-muted/30">
            <Avatar className="size-12 ring-2 ring-primary/10">
              <AvatarImage src={otherUser.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {otherUser.first_name[0]}{otherUser.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-lg">
                {otherUser.first_name} {otherUser.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {otherUser.university}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-muted/10">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Send className="size-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Aucun message</h3>
                <p className="text-sm text-muted-foreground">Envoyez le premier message à {otherUser.first_name} !</p>
              </div>
            ) : (
              messages.map((msg: any) => {
                const isOwn = msg.sender_id === user?.id
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <p className={`text-xs mt-1.5 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
            <div className="relative">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Votre message..."
                    disabled={sending}
                    autoFocus
                    className="h-12 text-base pr-12 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Ajouter un emoji"
                  >
                    <Smile className="size-5" />
                  </button>
                </div>
                <Button type="submit" disabled={sending || !newMessage.trim()} className="h-12 px-5 rounded-xl">
                  <Send className="size-5" />
                </Button>
              </div>

              {showEmojiPicker && (
                <div ref={emojiPickerRef} className="absolute bottom-full mb-2 right-0 z-50">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    searchPlaceHolder="Rechercher un emoji..."
                    width={350}
                    height={400}
                  />
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
