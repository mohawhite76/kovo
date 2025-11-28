import { useEffect, useState, useCallback } from 'react'
import { socketService } from '../services'
import { Message } from '../types'

export const useSocket = (otherUserId?: string) => {
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    setIsConnected(socketService.isConnected())
  }, [])

  useEffect(() => {
    if (!otherUserId) return

    socketService.joinConversation(otherUserId)

    return () => {
      socketService.leaveConversation(otherUserId)
    }
  }, [otherUserId])

  const startTyping = useCallback(() => {
    if (otherUserId) {
      socketService.startTyping(otherUserId)
    }
  }, [otherUserId])

  const stopTyping = useCallback(() => {
    if (otherUserId) {
      socketService.stopTyping(otherUserId)
    }
  }, [otherUserId])

  const onNewMessage = useCallback((callback: (message: Message) => void) => {
    socketService.onNewMessage(callback)
    return () => socketService.off('new_message', callback)
  }, [])

  const onMessageRead = useCallback((callback: (data: { messageId: string; readBy: string }) => void) => {
    socketService.onMessageRead(callback)
    return () => socketService.off('message_read', callback)
  }, [])

  const onMessagesRead = useCallback((callback: (data: { readBy: string; messageIds: string[] }) => void) => {
    socketService.onMessagesRead(callback)
    return () => socketService.off('messages_read', callback)
  }, [])

  const onMessageDeleted = useCallback((callback: (data: { messageId: string; deletedBy: string }) => void) => {
    socketService.onMessageDeleted(callback)
    return () => socketService.off('message_deleted', callback)
  }, [])

  const onUserTyping = useCallback((callback: (data: { userId: string; isTyping: boolean }) => void) => {
    const handler = (data: { userId: string; isTyping: boolean }) => {
      setIsTyping(data.isTyping)
      callback(data)
    }
    socketService.onUserTyping(handler)
    return () => socketService.off('user_typing', handler)
  }, [])

  return {
    isConnected,
    isTyping,
    startTyping,
    stopTyping,
    onNewMessage,
    onMessageRead,
    onMessagesRead,
    onMessageDeleted,
    onUserTyping,
  }
}
