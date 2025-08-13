"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus } from "lucide-react"
import { subscribeToConversations } from "@/lib/messages"
import type { Conversation } from "@/types/user"

interface ConversationListProps {
  userId: string
  selectedConversation: string | null
  onSelectConversation: (conversationId: string) => void
  onNewConversationClick: () => void
}

export function ConversationList({ 
  userId, 
  selectedConversation, 
  onSelectConversation, 
  onNewConversationClick 
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const unsubscribe = subscribeToConversations(userId, (convs) => {
      setConversations(convs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId])

  const filteredConversations = conversations.filter((conv) =>
    conv.participantNames.some((name) => name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else if (days === 1) {
      return "Hier"
    } else if (days < 7) {
      return date.toLocaleDateString("fr-FR", { weekday: "short" })
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      })
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une conversation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="w-full" size="sm" onClick={onNewConversationClick}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle conversation
        </Button>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Aucune conversation</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant={selectedConversation === conversation.id ? "secondary" : "ghost"}
                className="w-full justify-start h-auto p-3"
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {conversation.type === "class" ? "C" : conversation.participantNames[0]?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {conversation.type === "class" ? conversation.className : conversation.participantNames[0]}
                      </p>
                      {conversation.lastMessageTime && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.lastMessage || "Aucun message"}
                    </p>
                    {(conversation.unreadCounts?.[userId] || 0) > 0 && (
                      <div className="flex justify-end mt-1">
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conversation.unreadCounts?.[userId] || 0}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
