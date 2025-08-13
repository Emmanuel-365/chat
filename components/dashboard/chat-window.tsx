"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, MoreVertical, ArrowLeft, Loader2, Paperclip, Mic, StopCircle, Trash2 } from "lucide-react"
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

  // States for audio recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

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
      let attachmentType: Attachment['type'];
      if (file.name === 'recording.webm') {
        attachmentType = 'audio';
      } else {
        const resourceType = cloudinaryData.resource_type;
        if (resourceType === 'image') attachmentType = 'image';
        else if (resourceType === 'video') attachmentType = 'video';
        else if (resourceType === 'audio') attachmentType = 'audio';
        else attachmentType = 'file';
      }

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

  const handleStartRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const newMediaRecorder = new MediaRecorder(stream);
        setMediaRecorder(newMediaRecorder);

        const audioChunks: Blob[] = [];
        newMediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        newMediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          setAudioBlob(audioBlob);
        };

        newMediaRecorder.start();
        setIsRecording(true);
        setAudioBlob(null);
      } catch (err) {
        setUploadError("Permission pour le microphone refusée.");
      }
    } else {
      setUploadError("L\'enregistrement audio n\'est pas supporté sur ce navigateur.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleSendRecording = () => {
    if (audioBlob) {
      const audioFile = new File([audioBlob], "recording.webm", { type: audioBlob.type });
      // Crée un événement "artificiel" pour réutiliser la logique d'upload
      const event = { target: { files: [audioFile] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
      setAudioBlob(null);
    }
  };

  const handleDiscardRecording = () => {
    setAudioBlob(null);
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

        {audioBlob ? (
          <div className="flex items-center space-x-2">
            <audio src={URL.createObjectURL(audioBlob)} controls className="flex-1" />
            <Button size="sm" variant="ghost" onClick={handleDiscardRecording}><Trash2 className="h-4 w-4" /></Button>
            <Button size="sm" onClick={handleSendRecording}><Send className="h-4 w-4" /></Button>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button type="button" variant="ghost" size="sm" onClick={handleFileSelect} disabled={isUploading || isRecording}>
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
            </Button>
            <Input
              placeholder={isRecording ? "Enregistrement en cours..." : "Tapez votre message..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={loading || isUploading || isRecording}
              className="flex-1 text-sm sm:text-base"
            />
            {isRecording ? (
              <Button type="button" variant="destructive" size="sm" onClick={handleStopRecording}>
                <StopCircle className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" variant="ghost" size="sm" onClick={handleStartRecording} disabled={isUploading}>
                <Mic className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" disabled={loading || isUploading || isRecording || !newMessage.trim()} size="sm" className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
