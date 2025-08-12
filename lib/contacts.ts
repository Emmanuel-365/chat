import { collection, getDoc, getDocs, query, where, orderBy, doc } from "firebase/firestore";
import { db } from "./firebase";
import type { Class, SchoolUser } from "@/types/user";

export const getAllUsers = async (): Promise<SchoolUser[]> => {
  try {
    const q = query(collection(db, "users"), orderBy("displayName"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      lastSeen: doc.data().lastSeen?.toDate(),
    })) as SchoolUser[];
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return [];
  }
};

export const getUsersByRole = async (
  role: "student" | "teacher" | "admin"
): Promise<SchoolUser[]> => {
  try {
    const q = query(
      collection(db, "users"),
      where("role", "==", role),
      orderBy("displayName")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      lastSeen: doc.data().lastSeen?.toDate(),
    })) as SchoolUser[];
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs par rôle:", error);
    return [];
  }
};

export const getUsersByClass = async (classId: string): Promise<SchoolUser[]> => {
  try {
    const q = query(
      collection(db, "users"),
      where("studentProfile.classId", "==", classId),
      orderBy("displayName")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      lastSeen: doc.data().lastSeen?.toDate(),
    })) as SchoolUser[];
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des utilisateurs par classe:",
      error
    );
    return [];
  }
};

export const searchUsers = async (searchTerm: string): Promise<SchoolUser[]> => {
  try {
    const allUsers = await getAllUsers();

    return allUsers.filter(
      (user) =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.role === "student" &&
          user.studentProfile?.className
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()))
    );
  } catch (error) {
    console.error("Erreur lors de la recherche d'utilisateurs:", error);
    return [];
  }
};

export const getTeacherByClass = async (
  classId: string
): Promise<SchoolUser | null> => {
  try {
    const classRef = doc(db, "classes", classId);
    const classSnap = await getDoc(classRef);

    if (!classSnap.exists()) {
      return null;
    }

    const classData = classSnap.data() as Class;
    const teacherRef = doc(db, "users", classData.teacherId);
    const teacherSnap = await getDoc(teacherRef);

    if (!teacherSnap.exists()) {
      return null;
    }

    return teacherSnap.data() as SchoolUser;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du professeur de la classe:",
      error
    );
    return null;
  }
};

export const getUserById = async (userId: string): Promise<SchoolUser | null> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return userSnap.data() as SchoolUser;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }
};
