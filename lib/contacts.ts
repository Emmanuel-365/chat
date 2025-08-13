import { collection, getDoc, getDocs, query, where, orderBy, doc, QueryConstraint } from "firebase/firestore";
import { db } from "./firebase";
import type { Class, SchoolUser } from "@/types/user";

export const getAllUsers = async (): Promise<SchoolUser[]> => {
  try {
    const q = query(collection(db, "users"), orderBy("displayName"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      uid: doc.id,
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
  role: "student" | "teacher" | "admin",
  excludeId?: string
): Promise<SchoolUser[]> => {
  try {
    const q = query(
      collection(db, "users"),
      where("role", "==", role),
      orderBy("displayName")
    );
    const snapshot = await getDocs(q);

    const users = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      lastSeen: doc.data().lastSeen?.toDate(),
    })) as SchoolUser[];

    if (excludeId) {
      return users.filter((user) => user.uid !== excludeId);
    }
    return users;
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
      uid: doc.id,
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

export const searchUsers = async (searchTerm: string, currentUser: SchoolUser): Promise<SchoolUser[]> => {
  try {
    // Get the appropriate contacts based on the user's role first
    const contacts = await getContactsForUser(currentUser);
    const allContacts = Object.values(contacts).flat();

    if (!searchTerm.trim()) {
      return allContacts;
    }

    // Then filter those contacts locally
    return allContacts.filter(
      (user) =>
        user.uid !== currentUser.uid &&
        (user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  } catch (error) {
    console.error("Erreur lors de la recherche d'utilisateurs:", error);
    return [];
  }
};

export const getContactsForUser = async (user: SchoolUser): Promise<{ [key: string]: SchoolUser[] }> => {
  if (user.role === 'admin') {
    const [all, students, teachers, admins] = await Promise.all([
      getAllUsers(),
      getUsersByRole('student'),
      getUsersByRole('teacher'),
      getUsersByRole('admin'),
    ]);
    return { all, students, teachers, admins };
  }

  if (user.role === 'teacher') {
    // A teacher can see all other teachers and all students
    const [students, teachers] = await Promise.all([
      getUsersByRole('student'),
      getUsersByRole('teacher'),
    ]);
    return { students, teachers };
  }

  if (user.role === 'student' && user.studentProfile?.classId) {
    // A student can see their classmates and their teacher
    const classId = user.studentProfile.classId;
    const [classmates, teacher] = await Promise.all([
      getUsersByClass(classId),
      getTeacherByClass(classId),
    ]);
    const contacts: { [key: string]: SchoolUser[] } = { classmates };
    if (teacher) {
      contacts.teacher = [teacher];
    }
    return contacts;
  }

  return {};
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

    return { uid: teacherSnap.id, ...teacherSnap.data() } as SchoolUser;
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

    return { uid: userSnap.id, ...userSnap.data() } as SchoolUser;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }
};
