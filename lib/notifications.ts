import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"

import type { Notification } from "@/types/user";

export const createNotification = async (
  userId: string,
  type: Notification["type"],
  title: string,
  message: string,
  data?: Notification["data"],
): Promise<boolean> => {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      type,
      title,
      message,
      isRead: false,
      createdAt: serverTimestamp(),
      data: data || {},
    })
    return true
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error)
    return false
  }
}

export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void,
): Unsubscribe => {
  const q = query(collection(db, "notifications"), where("userId", "==", userId), orderBy("createdAt", "desc"))

  return onSnapshot(q, (snapshot) => {
    try {
      const notifications: Notification[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Notification)
      })
      callback(notifications)
    } catch (error) {
      console.error("Error processing notifications snapshot:", error);
      // Optionally, you might want to notify the UI about the error
    }
  })
}

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      isRead: true,
    })
    return true
  } catch (error) {
    console.error("Erreur lors du marquage de la notification:", error)
    return false
  }
}

export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    // Cette fonction nécessiterait une Cloud Function pour être optimale
    // Pour l'instant, on peut la laisser comme placeholder
    console.log("Marquer toutes les notifications comme lues pour:", userId)
    return true
  } catch (error) {
    console.error("Erreur lors du marquage de toutes les notifications:", error)
    return false
  }
}
