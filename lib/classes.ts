import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Class } from "@/types/user"

export const createClass = async (
  name: string,
  grade: string,
  teacherId: string,
  teacherName: string,
): Promise<{ success: boolean; error?: string; classId?: string }> => {
  try {
    const classData = {
      name,
      grade,
      teacherId,
      teacherName,
      studentIds: [],
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "classes"), classData)
    return { success: true, classId: docRef.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const getClasses = async (): Promise<Class[]> => {
  try {
    const q = query(collection(db, "classes"), orderBy("grade"), orderBy("name"))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Class[]
  } catch (error) {
    console.error("Erreur lors de la récupération des classes:", error)
    return []
  }
}

export const getClassesByTeacher = async (teacherId: string): Promise<Class[]> => {
  try {
    const q = query(collection(db, "classes"), where("teacherId", "==", teacherId), orderBy("grade"), orderBy("name"))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Class[]
  } catch (error) {
    console.error("Erreur lors de la récupération des classes du professeur:", error)
    return []
  }
}

export const addStudentToClass = async (classId: string, studentId: string): Promise<boolean> => {
  try {
    const classRef = doc(db, "classes", classId)
    const classDoc = await getDocs(query(collection(db, "classes"), where("__name__", "==", classId)))

    if (!classDoc.empty) {
      const classData = classDoc.docs[0].data() as Class
      const updatedStudentIds = [...(classData.studentIds || []), studentId]

      await updateDoc(classRef, {
        studentIds: updatedStudentIds,
      })

      // Mettre à jour l'utilisateur avec la classe
      const userRef = doc(db, "users", studentId)
      await updateDoc(userRef, {
        classId: classId,
        className: classData.name,
      })

      return true
    }
    return false
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'étudiant à la classe:", error)
    return false
  }
}

export const removeStudentFromClass = async (classId: string, studentId: string): Promise<boolean> => {
  try {
    const classRef = doc(db, "classes", classId)
    const classDoc = await getDocs(query(collection(db, "classes"), where("__name__", "==", classId)))

    if (!classDoc.empty) {
      const classData = classDoc.docs[0].data() as Class
      const updatedStudentIds = (classData.studentIds || []).filter((id) => id !== studentId)

      await updateDoc(classRef, {
        studentIds: updatedStudentIds,
      })

      // Retirer la classe de l'utilisateur
      const userRef = doc(db, "users", studentId)
      await updateDoc(userRef, {
        classId: null,
        className: null,
      })

      return true
    }
    return false
  } catch (error) {
    console.error("Erreur lors de la suppression de l'étudiant de la classe:", error)
    return false
  }
}

export const deleteClass = async (classId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, "classes", classId))
    return true
  } catch (error) {
    console.error("Erreur lors de la suppression de la classe:", error)
    return false
  }
}
