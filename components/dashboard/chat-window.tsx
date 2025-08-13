"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, MoreVertical, ArrowLeft, Loader2, Paperclip } from "lucide-react"
import { sendMessage, subscribeToMessages, markConversationAsRead } from "@/lib/messages"
import type { Attachment, Message } from "@/types/user"
import { getUserById } from "@/lib/contacts"
import type { SchoolUser } from "@/types/user"
import { Alert, AlertDescription } from "../ui/alert"
import { MessageAttachment } from "./message-attachment"

interface ChatWindowProps {
  conversationId: string
  currentUser: SchoolUser
  onBack?: () => void
}

export function ChatWindow({ conversationId, currentUser, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<SchoolUser | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [currentUser.uid, recipientId, classId])

  useEffect(() => {
    const fetchRecipient = async () => {
      if (recipientId) {
        const user = await getUserById(recipientId)
        setRecipient(user)
      }
    }
    fetchRecipient()
  }, [recipientId])

  useEffect(() => {
    if (conversationId) {
      markConversationAsRead(conversationId, currentUser.uid);
    }
  }, [conversationId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || loading) return

    setLoading(true)
    setSendError(null)
    const { success, error } = await sendMessage(currentUser, newMessage.trim(), recipientId, classId)

    if (success) {
      setNewMessage("")
    } else {
      setSendError(error || "Impossible d'envoyer le message.")
    }
    setLoading(false)
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // 1. Get signature from our API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paramsToSign: { timestamp: Math.round(new Date().getTime() / 1000) } })
      });
      const { signature, timestamp } = await response.json();

      // 2. Upload file to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!); 
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);

      const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
        method: 'POST',
        body: formData,
      });
      const cloudinaryData = await cloudinaryResponse.json();

      if (cloudinaryData.error) {
        throw new Error(cloudinaryData.error.message);
      }

      // 3. Create attachment object
      const resourceType = cloudinaryData.resource_type;
      let attachmentType: Attachment['type'] = 'file';
      if (resourceType === 'image') attachmentType = 'image';
      if (resourceType === 'video') attachmentType = 'video';
      if (resourceType === 'audio') attachmentType = 'audio';

      const attachment: Attachment = {
        url: cloudinaryData.secure_url,
        type: attachmentType,
        fileName: file.name,
        size: file.size,
        ...(cloudinaryData.width && { width: cloudinaryData.width }),
        ...(cloudinaryData.height && { height: cloudinaryData.height }),
        ...(cloudinaryData.duration && { duration: cloudinaryData.duration }),
      };

      // 4. Send message with attachment
      const result = await sendMessage(currentUser, "", attachment, recipientId, classId);
      if (!result.success) {
        throw new Error(result.error || "Impossible d'enregistrer le message dans la base de données.");
      }

    } catch (err: any) {
      setUploadError(err.message || 'Erreur lors de l\'envoi du fichier.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getConversationTitle = () => {
    if (isDirectMessage) {
      return recipient?.displayName || "Conversation directe"
    } else {
      return `Classe ${classId}`
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
              <AvatarFallback>{isDirectMessage ? recipientId?.[0]?.toUpperCase() : "C"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-lg font-semibold truncate">{getConversationTitle()}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isDirectMessage ? "En ligne" : `${messages.length} messages`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-2 sm:p-4" ref={scrollAreaRef}>
        <div className="space-y-3 sm:space-y-4">
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
                    className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                    }`}
                  >
                    {!isOwnMessage && message.senderDisplayName && (
                      <p className="text-xs font-medium mb-1 opacity-70">{message.senderDisplayName}</p>
                    )}
                    {message.content && <p className="text-sm break-words">{message.content}</p>}
                    {message.attachment && <MessageAttachment attachment={message.attachment} />}
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
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {uploadError && (
          <Alert variant="destructive" className="mb-2">
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
        {sendError && (
          <Alert variant="destructive" className="mb-2">
            <AlertDescription>{sendError}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button type="button" variant="ghost" size="sm" onClick={handleFileSelect} disabled={isUploading}>
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
          </Button>
          <Input
            placeholder="Tapez votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={loading || isUploading}
            className="flex-1 text-sm sm:text-base"
          />
          <Button type="submit" disabled={loading || isUploading || (!newMessage.trim() && !isUploading)} size="sm" className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
