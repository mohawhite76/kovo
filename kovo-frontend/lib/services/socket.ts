import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private token: string | null = null

  connect(token: string) {
    if (this.socket?.connected) {
      return
    }

    this.token = token
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

    this.socket = io(API_URL, {
      auth: { token },
      autoConnect: true,
    })

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
    })

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  joinConversation(otherUserId: string) {
    this.socket?.emit('join_conversation', otherUserId)
  }

  leaveConversation(otherUserId: string) {
    this.socket?.emit('leave_conversation', otherUserId)
  }

  startTyping(otherUserId: string) {
    this.socket?.emit('typing_start', otherUserId)
  }

  stopTyping(otherUserId: string) {
    this.socket?.emit('typing_stop', otherUserId)
  }

  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('new_message', callback)
  }

  onMessageRead(callback: (data: { messageId: string; readBy: string }) => void) {
    this.socket?.on('message_read', callback)
  }

  onMessagesRead(callback: (data: { readBy: string; messageIds: string[] }) => void) {
    this.socket?.on('messages_read', callback)
  }

  onMessageDeleted(callback: (data: { messageId: string; deletedBy: string }) => void) {
    this.socket?.on('message_deleted', callback)
  }

  onUserTyping(callback: (data: { userId: string; isTyping: boolean }) => void) {
    this.socket?.on('user_typing', callback)
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback)
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export const socketService = new SocketService()
