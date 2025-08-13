import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Class, SchoolUser } from "@/types/user";

export const createClass = async (
  name: string,
  grade: string,
  teacherId: string
): Promise<{ success: boolean; error?: string; classId?: string }> => {
  try {
    const classData = {
      name,
      grade,
      teacherId,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "classes"), classData);
    return { success: true, classId: docRef.id };
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
};

export const getClasses = async (): Promise<Class[]> => {
  try {
    const q = query(collection(db, "classes"), orderBy("grade"), orderBy("name"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Class[];
  } catch (error) {
    console.error("Erreur lors de la récupération des classes:", error);
    return [];
  }
};

export const getClassById = async (classId: string): Promise<Class | null> => {
  try {
    const classRef = doc(db, "classes", classId);
    const classSnap = await getDoc(classRef);

    if (!classSnap.exists()) {
      return null;
    }

    return {
      id: classSnap.id,
      ...classSnap.data(),
      createdAt: classSnap.data().createdAt?.toDate() || new Date(),
    } as Class;
  } catch (error) {
    console.error("Erreur lors de la récupération de la classe:", error);
    return null;
  }
};

export const getClassesByTeacher = async (teacherId: string): Promise<Class[]> => {
  try {
    const q = query(
      collection(db, "classes"),
      where("teacherId", "==", teacherId),
      orderBy("grade"),
      orderBy("name")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Class[];
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des classes du professeur:",
      error
    );
    return [];
  }
};

export const addStudentToClass = async (
  classId: string,
  studentId: string
): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", studentId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data() as SchoolUser;
      if (userData.studentProfile && userData.studentProfile.classId) {
        console.error("L'étudiant est déjà dans une classe.");
        return false;
      }
    }

    const classRef = doc(db, "classes", classId);
    const classDoc = await getDoc(classRef);

    if (classDoc.exists()) {
      const classData = classDoc.data() as Class;
      await updateDoc(userRef, {
        studentProfile: {
          classId: classId,
          className: classData.name,
          grade: classData.grade,
        },
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'étudiant à la classe:", error);
    return false;
  }
};

export const removeStudentFromClass = async (
  studentId: string
): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", studentId);
    await updateDoc(userRef, {
      studentProfile: null,
    });
    return true;
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'étudiant de la classe:",
      error
    );
    return false;
  }
};

export const deleteClass = async (classId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, "classes", classId));
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de la classe:", error);
    return false;
  }
};