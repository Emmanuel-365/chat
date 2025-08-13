import { collection, getDoc, getDocs, query, where, orderBy, doc } from "firebase/firestore";
import { db } from "./firebase";
import type { SchoolUser } from "@/types/user";
import { getCoursesByClass, getCoursesByTeacher } from "./courses";

// Keep this for admin role
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
  role: "student" | "teacher" | "admin" | "staff",
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

export const getContactsForUser = async (user: SchoolUser): Promise<{ [key: string]: SchoolUser[] }> => {
    if (user.role === 'admin') {
      const [students, teachers, admins, staff] = await Promise.all([
        getUsersByRole('student'),
        getUsersByRole('teacher'),
        getUsersByRole('admin'),
        getUsersByRole('staff'),
      ]);
      return { students, teachers, admins, staff };
    }
  
    if (user.role === 'teacher') {
      // A teacher sees students from their courses and other teachers.
      const courses = await getCoursesByTeacher(user.uid);
      const classIds = [...new Set(courses.flatMap(c => c.classIds))];
      
      const studentPromises = classIds.map(id => getUsersByClass(id));
      const students = (await Promise.all(studentPromises)).flat();
      const uniqueStudents = Array.from(new Map(students.map(s => [s.uid, s])).values());

      const teachers = await getUsersByRole('teacher', user.uid);
      
      return { 'Mes Étudiants': uniqueStudents, 'Professeurs': teachers };
    }
  
    if (user.role === 'student' && user.studentProfile?.classId) {
      // A student sees their classmates and all their teachers.
      const classId = user.studentProfile.classId;
      const [classmates, courses] = await Promise.all([
        getUsersByClass(classId),
        getCoursesByClass(classId),
      ]);

      const teacherIds = [...new Set(courses.map(c => c.teacherId))];
      const teacherPromises = teacherIds.map(id => getUserById(id));
      const teachers = (await Promise.all(teacherPromises)).filter(t => t !== null) as SchoolUser[];
      
      return { 'Ma Classe': classmates.filter(c => c.uid !== user.uid), 'Mes Professeurs': teachers };
    }
  
    return {};
  };

  export const searchUsers = async (searchTerm: string, currentUser: SchoolUser): Promise<SchoolUser[]> => {
    try {
      // Get the appropriate contacts based on the user's role first
      const contacts = await getContactsForUser(currentUser);
      const allContacts = Object.values(contacts).flat();
  
      // Remove duplicates
      const uniqueContacts = Array.from(new Map(allContacts.map(c => [c.uid, c])).values());

      if (!searchTerm.trim()) {
        return uniqueContacts.filter(user => user.uid !== currentUser.uid);
      }
  
      // Then filter those contacts locally
      return uniqueContacts.filter(
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