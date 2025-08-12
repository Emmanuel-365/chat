import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Message } from "@/types/user"

export interface Conversation {
  id: string
  participants: string[]
  participantNames: string[]
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount: number
  type: "direct" | "class"
  className?: string
}

export const sendMessage = async (
  senderId: string,
  senderName: string,
  senderRole: "student" | "teacher" | "admin",
  content: string,
  recipientId?: string,
  classId?: string,
) => {
  try {
    const messageData = {
      senderId,
      senderName,
      senderRole,
      content,
      timestamp: serverTimestamp(),
      isRead: false,
      type: recipientId ? "direct" : "class",
      ...(recipientId && { recipientId }),
      ...(classId && { classId }),
    }

    await addDoc(collection(db, "messages"), messageData)
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const subscribeToMessages = (
  userId: string,
  recipientId?: string,
  classId?: string,
  callback: (messages: Message[]) => void,
): Unsubscribe => {
  let q

  if (recipientId) {
    // Messages directs entre deux utilisateurs
    q = query(collection(db, "messages"), where("type", "==", "direct"), orderBy("timestamp", "asc"))
  } else if (classId) {
    // Messages de classe
    q = query(
      collection(db, "messages"),
      where("classId", "==", classId),
      where("type", "==", "class"),
      orderBy("timestamp", "asc"),
    )
  } else {
    // Tous les messages pour l'utilisateur
    q = query(collection(db, "messages"), orderBy("timestamp", "desc"))
  }

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()

      // Filtrer les messages directs pour l'utilisateur actuel
      if (recipientId) {
        if (
          (data.senderId === userId && data.recipientId === recipientId) ||
          (data.senderId === recipientId && data.recipientId === userId)
        ) {
          messages.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
          } as Message)
        }
      } else {
        messages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as Message)
      }
    })
    callback(messages)
  })
}

export const markMessageAsRead = async (messageId: string) => {
  try {
    await updateDoc(doc(db, "messages", messageId), {
      isRead: true,
    })
  } catch (error) {
    console.error("Erreur lors du marquage du message comme lu:", error)
  }
}

export const getConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    // Récupérer tous les messages où l'utilisateur est impliqué
    const messagesQuery = query(collection(db, "messages"), orderBy("timestamp", "desc"))

    const snapshot = await getDocs(messagesQuery)
    const conversations = new Map<string, Conversation>()

    snapshot.forEach((doc) => {
      const message = { id: doc.id, ...doc.data() } as Message

      // Vérifier si l'utilisateur est impliqué dans ce message
      const isInvolved =
        message.senderId === userId || message.recipientId === userId || (message.type === "class" && message.classId)

      if (isInvolved) {
        let conversationId: string
        let participants: string[]
        let participantNames: string[]
        let type: "direct" | "class"
        let className: string | undefined

        if (message.type === "direct") {
          // Conversation directe
          const otherUserId = message.senderId === userId ? message.recipientId! : message.senderId
          conversationId = [userId, otherUserId].sort().join("-")
          participants = [userId, otherUserId]
          participantNames = [message.senderName]
          type = "direct"
        } else {
          // Conversation de classe
          conversationId = `class-${message.classId}`
          participants = [message.senderId]
          participantNames = [message.senderName]
          type = "class"
          className = message.classId
        }

        if (!conversations.has(conversationId)) {
          conversations.set(conversationId, {
            id: conversationId,
            participants,
            participantNames,
            lastMessage: message.content,
            lastMessageTime: message.timestamp,
            unreadCount: message.isRead ? 0 : 1,
            type,
            className,
          })
        }
      }
    })

    return Array.from(conversations.values())
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations:", error)
    return []
  }
}
