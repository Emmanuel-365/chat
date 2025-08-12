"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, AlertTriangle, MessageCircle, Clock } from "lucide-react"
import { getRecentMessages, deleteMessage } from "@/lib/admin"
import { RoleBadge } from "@/components/auth/role-badge"
import type { Message } from "@/types/user"

export function MessageModeration() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const loadMessages = async () => {
      const recentMessages = await getRecentMessages(100)
      setMessages(recentMessages)
      setLoading(false)
    }

    loadMessages()
  }, [])

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      return
    }

    setDeletingId(messageId)
    const success = await deleteMessage(messageId)

    if (success) {
      setMessages(messages.filter((m) => m.id !== messageId))
    }

    setDeletingId(null)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    return `Il y a ${days}j`
  }

  const MessageCard = ({ message }: { message: Message }) => {
    const initials = message.senderName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">{message.senderName}</span>
                  <RoleBadge role={message.senderRole} />
                  <Badge variant="outline" className="text-xs">
                    {message.type === "direct" ? "Direct" : "Classe"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-900 dark:text-gray-100 mb-2 break-words">{message.content}</p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(message.timestamp)}</span>
                  </div>
                  {message.type === "class" && message.classId && (
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>Classe {message.classId}</span>
                    </div>
                  )}
                  {!message.isRead && (
                    <Badge variant="secondary" className="text-xs">
                      Non lu
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeleteMessage(message.id)}
              disabled={deletingId === message.id}
            >
              {deletingId === message.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Modération des Messages</h1>
          <p className="text-muted-foreground">Surveillez et modérez les conversations</p>
        </div>
        <Badge variant="secondary">{messages.length} messages récents</Badge>
      </div>

      {/* Warning */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Cette section vous permet de surveiller et supprimer les messages inappropriés. Utilisez cette fonctionnalité
          avec responsabilité et conformément à votre politique de modération.
        </AlertDescription>
      </Alert>

      {/* Messages List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun message récent</p>
            </div>
          ) : (
            messages.map((message) => <MessageCard key={message.id} message={message} />)
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
