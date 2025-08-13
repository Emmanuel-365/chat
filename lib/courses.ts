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
import type { Course } from "@/types/user";

export const createCourse = async (
  name: string,
  teacherId: string,
  classIds: string[]
): Promise<{ success: boolean; error?: string; courseId?: string }> => {
  try {
    const courseData = {
      name,
      teacherId,
      classIds,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "courses"), courseData);
    return { success: true, courseId: docRef.id };
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
};

export const getCourses = async (): Promise<Course[]> => {
  try {
    const q = query(collection(db, "courses"), orderBy("name"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Course[];
  } catch (error) {
    console.error("Erreur lors de la récupération des cours:", error);
    return [];
  }
};

export const getCourseById = async (courseId: string): Promise<Course | null> => {
  try {
    const courseRef = doc(db, "courses", courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      return null;
    }

    return {
      id: courseSnap.id,
      ...courseSnap.data(),
      createdAt: courseSnap.data().createdAt?.toDate() || new Date(),
    } as Course;
  } catch (error) {
    console.error("Erreur lors de la récupération du cours:", error);
    return null;
  }
};

export const getCoursesByTeacher = async (teacherId: string): Promise<Course[]> => {
  try {
    const q = query(
      collection(db, "courses"),
      where("teacherId", "==", teacherId),
      orderBy("name")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Course[];
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des cours du professeur:",
      error
    );
    return [];
  }
};

export const getCoursesByClass = async (classId: string): Promise<Course[]> => {
    try {
      const q = query(
        collection(db, "courses"),
        where("classIds", "array-contains", classId),
        orderBy("name")
      );
      const snapshot = await getDocs(q);
  
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Course[];
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des cours de la classe:",
        error
      );
      return [];
    }
  };

export const updateCourse = async (courseId: string, updates: Partial<Course>): Promise<boolean> => {
    try {
        const courseRef = doc(db, "courses", courseId);
        await updateDoc(courseRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Erreur lors de la mise à jour du cours:", error);
        return false;
    }
};


export const deleteCourse = async (courseId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, "courses", courseId));
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression du cours:", error);
    return false;
  }
};
