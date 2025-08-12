import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { SchoolUser, Message } from "@/types/user"

export interface AdminStats {
  totalUsers: number
  totalStudents: number
  totalTeachers: number
  totalAdmins: number
  totalClasses: number
  totalMessages: number
  activeUsers: number
}

export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const [usersSnapshot, classesSnapshot, messagesSnapshot] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "classes")),
      getDocs(collection(db, "messages")),
    ])

    const users = usersSnapshot.docs.map((doc) => doc.data() as SchoolUser)
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

    const stats: AdminStats = {
      totalUsers: users.length,
      totalStudents: users.filter((u) => u.role === "student").length,
      totalTeachers: users.filter((u) => u.role === "teacher").length,
      totalAdmins: users.filter((u) => u.role === "admin").length,
      totalClasses: classesSnapshot.size,
      totalMessages: messagesSnapshot.size,
      activeUsers: users.filter((u) => u.lastSeen && u.lastSeen > fiveMinutesAgo).length,
    }

    return stats
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error)
    return {
      totalUsers: 0,
      totalStudents: 0,
      totalTeachers: 0,
      totalAdmins: 0,
      totalClasses: 0,
      totalMessages: 0,
      activeUsers: 0,
    }
  }
}

export const updateUserRole = async (userId: string, newRole: "student" | "teacher" | "admin"): Promise<boolean> => {
  try {
    await updateDoc(doc(db, "users", userId), {
      role: newRole,
      updatedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle:", error)
    return false
  }
}

export const toggleUserStatus = async (userId: string, isActive: boolean): Promise<boolean> => {
  try {
    await updateDoc(doc(db, "users", userId), {
      isActive,
      updatedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error)
    return false
  }
}

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, "users", userId))
    return true
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error)
    return false
  }
}

export const getRecentMessages = async (limitCount = 50): Promise<Message[]> => {
  try {
    const q = query(collection(db, "messages"), orderBy("timestamp", "desc"), limit(limitCount))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as Message[]
  } catch (error) {
    console.error("Erreur lors de la récupération des messages récents:", error)
    return []
  }
}

export const deleteMessage = async (messageId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, "messages", messageId))
    return true
  } catch (error) {
    console.error("Erreur lors de la suppression du message:", error)
    return false
  }
}
