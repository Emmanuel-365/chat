import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "./firebase"
import type { SchoolUser, UserRole } from "@/types/user"

export const createAccount = async (
  email: string,
  password: string,
  displayName: string,
  role: UserRole,
  classId?: string,
  className?: string,
  grade?: string,
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create user document in Firestore
    const userData: SchoolUser = {
      uid: user.uid,
      email: user.email!,
      displayName,
      role,
      classId,
      className,
      grade,
      isActive: true,
      createdAt: new Date(),
    }

    await setDoc(doc(db, "users", user.uid), userData)
    return { user: userData, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid))
    if (userDoc.exists()) {
      const userData = userDoc.data() as SchoolUser

      // Update last seen
      await updateDoc(doc(db, "users", user.uid), {
        lastSeen: new Date(),
      })

      return { user: userData, error: null }
    } else {
      throw new Error("Données utilisateur introuvables")
    }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const getCurrentUser = async (): Promise<SchoolUser | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      unsubscribe()
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          resolve(userDoc.data() as SchoolUser)
        } else {
          resolve(null)
        }
      } else {
        resolve(null)
      }
    })
  })
}
