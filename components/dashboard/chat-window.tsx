"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, MoreVertical } from "lucide-react"
import { sendMessage, subscribeToMessages, type Message } from "@/lib/messages"
import type { SchoolUser } from "@/types/user"

interface ChatWindowProps {
  conversationId: string
  currentUser: SchoolUser
}

export function ChatWindow({ conversationId, currentUser }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Déterminer le type de conversation et les paramètres
  const isDirectMessage = !conversationId.startsWith("class-")
  const recipientId = isDirectMessage ? conversationId.split("-").find((id) => id !== currentUser.uid) : undefined
  const classId = !isDirectMessage ? conversationId.replace("class-", "") : undefined

  useEffect(() => {
    const unsubscribe = subscribeToMessages(currentUser.uid, recipientId, classId, (newMessages) => {
      setMessages(newMessages)
      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
      }, 100)
    })

    return () => unsubscribe()
  }, [currentUser.uid, recipientId, classId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || loading) return

    setLoading(true)
    const { success } = await sendMessage(
      currentUser.uid,
      currentUser.displayName,
      currentUser.role,
      newMessage.trim(),
      recipientId,
      classId,
    )

    if (success) {
      setNewMessage("")
    }
    setLoading(false)
  }

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getConversationTitle = () => {
    if (isDirectMessage) {
      return recipientId || "Conversation directe"
    } else {
      return `Classe ${classId}`
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>{isDirectMessage ? recipientId?.[0]?.toUpperCase() : "C"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{getConversationTitle()}</h2>
              <p className="text-sm text-muted-foreground">
                {isDirectMessage ? "En ligne" : `${messages.length} messages`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun message dans cette conversation</p>
              <p className="text-sm text-muted-foreground mt-2">
                Envoyez le premier message pour commencer la discussion
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId === currentUser.uid
              return (
                <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                    }`}
                  >
                    {!isOwnMessage && <p className="text-xs font-medium mb-1 opacity-70">{message.senderName}</p>}
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwnMessage ? "text-blue-100" : "text-muted-foreground"}`}>
                      {formatMessageTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            placeholder="Tapez votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
