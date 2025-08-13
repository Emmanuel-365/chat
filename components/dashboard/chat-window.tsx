"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, MoreVertical, ArrowLeft, Loader2, Paperclip, Mic, StopCircle, Trash2, File as FileIcon } from "lucide-react"
import { sendMessage, subscribeToMessages, markConversationAsRead } from "@/lib/messages"
import type { Attachment, Message, SchoolUser, Course } from "@/types/user"
import { getUserById } from "@/lib/contacts"
import { getCourseById } from "@/lib/courses"
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
  const [conversationTitle, setConversationTitle] = useState("Conversation");
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const [fileToPreview, setFileToPreview] = useState<File | null>(null);
  const [caption, setCaption] = useState("");

  const conversationDetails = useMemo(() => {
    if (conversationId.startsWith('course-')) {
      return { type: 'course', id: conversationId.replace('course-', '') };
    } else if (conversationId.startsWith('class-')) {
      return { type: 'class', id: conversationId.replace('class-', '') };
    } else {
      const recipientId = conversationId.split('-').find(id => id !== currentUser.uid);
      return { type: 'direct', id: recipientId };
    }
  }, [conversationId, currentUser.uid]);

  useEffect(() => {
    const ids = {
      recipientId: conversationDetails.type === 'direct' ? conversationDetails.id : undefined,
      classId: conversationDetails.type === 'class' ? conversationDetails.id : undefined,
      courseId: conversationDetails.type === 'course' ? conversationDetails.id : undefined,
    };

    const unsubscribe = subscribeToMessages(currentUser.uid, ids, (newMessages) => {
      setMessages(newMessages)
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
      }, 100)
    });

    return () => {
      if (unsubscribe) unsubscribe();
    }
  }, [currentUser.uid, conversationDetails]);

  useEffect(() => {
    const fetchTitle = async () => {
      if (conversationDetails.type === 'direct' && conversationDetails.id) {
        const user = await getUserById(conversationDetails.id);
        setConversationTitle(user?.displayName || "Conversation directe");
      } else if (conversationDetails.type === 'course' && conversationDetails.id) {
        const course = await getCourseById(conversationDetails.id);
        setConversationTitle(course?.name || "Conversation de cours");
      } else if (conversationDetails.type === 'class' && conversationDetails.id) {
        setConversationTitle(`Classe ${conversationDetails.id}`); // Simple fallback
      }
    };
    fetchTitle();
  }, [conversationDetails]);

  useEffect(() => {
    if (conversationId) {
      markConversationAsRead(conversationId, currentUser.uid);
    }
  }, [conversationId, currentUser.uid]);

  const handleSendMessage = async (attachment: Attachment | null = null, text: string = newMessage) => {
    if (!text.trim() && !attachment) return;

    setLoading(true);
    setSendError(null);

    const ids = {
        recipientId: conversationDetails.type === 'direct' ? conversationDetails.id : undefined,
        classId: conversationDetails.type === 'class' ? conversationDetails.id : undefined,
        courseId: conversationDetails.type === 'course' ? conversationDetails.id : undefined,
    };

    const { success, error } = await sendMessage(currentUser, text.trim(), attachment, ids);

    if (success) {
      setNewMessage("");
      setCaption("");
      setFileToPreview(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setSendError(error || "Impossible d'envoyer le message.");
    }
    setLoading(false);
    setIsUploading(false);
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileToPreview(file);
    }
  };

  const handleSendFile = async () => {
    if (!fileToPreview) return;

    const file = fileToPreview;
    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paramsToSign: { timestamp: Math.round(new Date().getTime() / 1000) } })
      });
      const { signature, timestamp } = await response.json();

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

      if (cloudinaryData.error) throw new Error(cloudinaryData.error.message);

      let attachmentType: Attachment['type'] = file.name === 'recording.webm' ? 'audio' : (cloudinaryData.resource_type === 'image' ? 'image' :cloudinaryData.resource_type === 'video' ? 'video' : 'file');

      const attachment: Attachment = {
        url: cloudinaryData.secure_url,
        type: attachmentType,
        fileName: file.name,
        size: file.size,
        ...(cloudinaryData.width && { width: cloudinaryData.width }),
        ...(cloudinaryData.height && { height: cloudinaryData.height }),
        ...(cloudinaryData.duration && { duration: cloudinaryData.duration }),
      };

      await handleSendMessage(attachment, caption);

    } catch (err: any) {
      setUploadError(err.message || 'Erreur lors de l\'envoi du fichier.');
      setIsUploading(false);
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
      setFileToPreview(audioFile);
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

  const handleCancelPreview = () => {
    setFileToPreview(null);
    setCaption("");
    if(fileInputRef.current) fileInputRef.current.value = '';
  }

  if (fileToPreview) {
    const fileUrl = URL.createObjectURL(fileToPreview);
    return (
      <div className="flex flex-col h-full bg-gray-800 text-white">
        <div className="p-3 flex items-center justify-between bg-gray-900">
          <Button variant="ghost" onClick={handleCancelPreview}>Annuler</Button>
          <h3 className="font-semibold">Aperçu</h3>
          <div className="w-20"></div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          {fileToPreview.type.startsWith('image') ? (
            <img src={fileUrl} alt="Aperçu" className="max-h-full max-w-full object-contain" />
          ) : fileToPreview.type.startsWith('video') ? (
            <video src={fileUrl} controls className="max-h-full max-w-full" />
          ) : fileToPreview.type.startsWith('audio') ? (
            <audio src={fileUrl} controls />
          ) : (
            <div className="text-center">
              <FileIcon className="h-16 w-16 mx-auto" />
              <p className="mt-2">{fileToPreview.name}</p>
            </div>
          )}
        </div>
        <div className="p-2 bg-gray-900 flex items-center space-x-2">
          <Input 
            placeholder="Ajouter une légende..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
          <Button onClick={handleSendFile} disabled={isUploading} size="icon" className="rounded-full bg-green-600 hover:bg-green-700">
            {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
              <AvatarFallback>{conversationTitle?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-lg font-semibold truncate">{conversationTitle}</h2>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-2 sm:p-4" ref={scrollAreaRef}>
        <div className="space-y-3 sm:space-y-4">
          {messages.map((message) => {
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
                  {!isOwnMessage && (conversationDetails.type === 'class' || conversationDetails.type === 'course') && message.senderDisplayName && (
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
          })}
        </div>
      </ScrollArea>

      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {uploadError && <Alert variant="destructive" className="mb-2"><AlertDescription>{uploadError}</AlertDescription></Alert>}
        {sendError && <Alert variant="destructive" className="mb-2"><AlertDescription>{sendError}</AlertDescription></Alert>}

        {audioBlob ? (
          <div className="flex items-center space-x-2">
            <audio src={URL.createObjectURL(audioBlob)} controls className="flex-1" />
            <Button size="sm" variant="ghost" onClick={handleDiscardRecording}><Trash2 className="h-4 w-4" /></Button>
            <Button size="sm" onClick={handleSendRecording}><Send className="h-4 w-4" /></Button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(null, newMessage); }} className="flex space-x-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <Button type="button" variant="ghost" size="sm" onClick={handleFileSelect} disabled={isUploading || isRecording}>
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
            </Button>
            <Input
              placeholder="Tapez votre message..."
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
