import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  type Unsubscribe,
  setDoc,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Message, SchoolUser, Conversation, Class, Course, Attachment } from "@/types/user";
import { getUserById, getUsersByClass } from "./contacts";
import { getCoursesByClass, getCourseById } from "./courses";

interface SendMessageIds {
  recipientId?: string;
  classId?: string;
  courseId?: string;
}

export const sendMessage = async (
  sender: SchoolUser,
  content: string,
  attachment: Attachment | null,
  ids: SendMessageIds
) => {
  const { recipientId, classId, courseId } = ids;

  try {
    let participants: string[] = [];
    let conversationId: string = '';
    let messageType: Message['type'] = 'direct';
    let conversationType: Conversation['type'] = 'direct';

    // Déterminer les participants et le type de conversation
    if (courseId) {
      const course = await getCourseById(courseId);
      if (!course) throw new Error("Course not found");
      const students = (await Promise.all(course.classIds.map(cid => getUsersByClass(cid)))).flat();
      const studentIds = students.map(s => s.uid);
      participants = [...new Set([course.teacherId, ...studentIds])];
      conversationId = `course-${courseId}`;
      messageType = 'course';
      conversationType = 'course';
    } else if (classId) {
      const students = await getUsersByClass(classId);
      const courses = await getCoursesByClass(classId);
      const teacherIds = [...new Set(courses.map(c => c.teacherId))];
      const studentIds = students.map(s => s.uid);
      participants = [...new Set([...studentIds, ...teacherIds])];
      conversationId = `class-${classId}`;
      messageType = 'class';
      conversationType = 'class';
    } else if (recipientId) {
      participants = [sender.uid, recipientId].sort();
      conversationId = participants.join("-");
      messageType = 'direct';
      conversationType = 'direct';
    } else {
      throw new Error("No recipient, class, or course ID provided.");
    }

    // Créer le message
    const messageData: Omit<Message, "id" | "timestamp"> & { timestamp: any } = {
      senderId: sender.uid,
      senderDisplayName: sender.displayName || sender.email,
      senderRole: sender.role,
      content: content || '',
      attachment,
      timestamp: serverTimestamp(),
      isRead: false,
      type: messageType,
      participants,
      ...(recipientId && { recipientId }),
      ...(classId && { classId }),
      ...(courseId && { courseId }),
    };
    await addDoc(collection(db, "messages"), messageData);

    // Mettre à jour ou créer la conversation
    const conversationRef = doc(db, "conversations", conversationId);
    const conversationSnap = await getDoc(conversationRef);

    let lastMessageText = content;
    if (attachment) {
      switch (attachment.type) {
        case 'image': lastMessageText = '📷 Photo'; break;
        case 'video': lastMessageText = '📹 Vidéo'; break;
        case 'audio': lastMessageText = '🎵 Audio'; break;
        default: lastMessageText = '📎 Fichier'; break;
      }
    }

    const unreadCountsUpdate: { [key: string]: any } = {};
    participants.forEach(pId => {
      if (pId !== sender.uid) {
        unreadCountsUpdate[`unreadCounts.${pId}`] = increment(1);
      }
    });

    if (conversationSnap.exists()) {
      await updateDoc(conversationRef, {
        lastMessage: lastMessageText,
        lastMessageTime: serverTimestamp(),
        participants,
        ...unreadCountsUpdate,
      });
    } else {
      const unreadCounts: { [key: string]: number } = {};
      participants.forEach(pId => {
        unreadCounts[pId] = pId === sender.uid ? 0 : 1;
      });

      const participantUsers = await Promise.all(participants.map(p => getUserById(p)));
      const participantNames = participantUsers.filter(Boolean).map(p => p!.displayName || p!.email!);

      const conversationData: Partial<Omit<Conversation, 'id' | 'lastMessageTime'> & { lastMessageTime: any }> = {
        participants,
        participantNames,
        lastMessage: lastMessageText,
        lastMessageTime: serverTimestamp(),
        unreadCounts,
        type: conversationType,
      };

      if (courseId) {
        const course = await getCourseById(courseId);
        conversationData.courseId = courseId;
        conversationData.courseName = course?.name;
      } else if (classId) {
        const classDoc = await getDoc(doc(db, "classes", classId));
        conversationData.classId = classId;
        conversationData.className = (classDoc.data() as Class)?.name;
      }

      await setDoc(conversationRef, conversationData);
    }

    return { success: true, error: null };
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
};

export const subscribeToMessages = (
  userId: string,
  ids: { recipientId?: string; classId?: string; courseId?: string },
  callback: (messages: Message[]) => void
): Unsubscribe | undefined => {
  const { recipientId, classId, courseId } = ids;
  let q;

  if (recipientId) {
    q = query(
      collection(db, "messages"),
      where("type", "==", "direct"),
      where("participants", "==", [userId, recipientId].sort()),
      orderBy("timestamp", "asc")
    );
  } else if (classId) {
    q = query(
      collection(db, "messages"),
      where("classId", "==", classId),
      where("type", "==", "class"),
      orderBy("timestamp", "asc")
    );
  } else if (courseId) {
    q = query(
      collection(db, "messages"),
      where("courseId", "==", courseId),
      where("type", "==", "course"),
      orderBy("timestamp", "asc")
    );
  } else {
    return;
  }

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    } as Message));
    callback(messages);
  }, (error) => {
    console.error("Error subscribing to messages:", error);
    callback([]);
  });
};

export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageTime", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const conversations: Conversation[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      lastMessageTime: doc.data().lastMessageTime?.toDate(),
    })) as Conversation[];
    callback(conversations);
  }, (error) => {
    console.error("Error subscribing to conversations:", error);
    callback([]);
  });
};

export const markConversationAsRead = async (conversationId: string, userId: string) => {
  try {
    const conversationRef = doc(db, "conversations", conversationId);
    await updateDoc(conversationRef, { [`unreadCounts.${userId}`]: 0 });
  } catch (error) {
    console.error("Erreur lors du marquage de la conversation comme lue:", error);
  }
};
