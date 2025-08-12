import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "./firebase"
import type { SchoolUser } from "@/types/user"

export const getAllUsers = async (): Promise<SchoolUser[]> => {
  try {
    const q = query(collection(db, "users"), orderBy("displayName"))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      lastSeen: doc.data().lastSeen?.toDate(),
    })) as SchoolUser[]
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)
    return []
  }
}

export const getUsersByRole = async (role: "student" | "teacher" | "admin"): Promise<SchoolUser[]> => {
  try {
    const q = query(collection(db, "users"), where("role", "==", role), orderBy("displayName"))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      lastSeen: doc.data().lastSeen?.toDate(),
    })) as SchoolUser[]
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs par rôle:", error)
    return []
  }
}

export const getUsersByClass = async (classId: string): Promise<SchoolUser[]> => {
  try {
    const q = query(collection(db, "users"), where("classId", "==", classId), orderBy("displayName"))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      lastSeen: doc.data().lastSeen?.toDate(),
    })) as SchoolUser[]
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs par classe:", error)
    return []
  }
}

export const searchUsers = async (searchTerm: string): Promise<SchoolUser[]> => {
  try {
    const allUsers = await getAllUsers()

    return allUsers.filter(
      (user) =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.className && user.className.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  } catch (error) {
    console.error("Erreur lors de la recherche d'utilisateurs:", error)
    return []
  }
}
