"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { SchoolUser } from "@/types/user"

export const useAuth = () => {
  const [user, setUser] = useState<SchoolUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email!, ...userDoc.data() } as SchoolUser)
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, loading }
}
