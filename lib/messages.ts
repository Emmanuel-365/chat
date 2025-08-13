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
import type { Message, SchoolUser, Conversation, Class } from "@/types/user";
import { getUserById, getUsersByClass, getTeacherByClass } from "./contacts";

export const sendMessage = async (
  sender: SchoolUser,
  content: string,
  recipientId?: string,
  classId?: string
) => {
  try {
    const isClassMessage = !!classId;
    let participants: string[] = [];
    if (isClassMessage) {
      const students = await getUsersByClass(classId);
      const teacher = await getTeacherByClass(classId);
      participants = students.map(s => s.uid);
      if (teacher && !participants.includes(teacher.uid)) {
        participants.push(teacher.uid);
      }
    } else if (recipientId) {
      participants = [sender.uid, recipientId].sort();
    }

    const messageData: Omit<Message, "id" | "timestamp"> & { timestamp: any } = {
      senderId: sender.uid,
      senderDisplayName: sender.displayName || sender.email,
      senderRole: sender.role,
      content,
      timestamp: serverTimestamp(),
      isRead: false,
      type: isClassMessage ? "class" : "direct",
      participants,
    };

    if (recipientId) {
      messageData.recipientId = recipientId;
    }
    if (classId) {
      messageData.classId = classId;
    }

    await addDoc(collection(db, "messages"), messageData);

    // Update conversation
    let conversationId: string;
    if (recipientId) {
      conversationId = participants.join("-");
    } else {
      conversationId = `class-${classId}`;
    }

    const conversationRef = doc(db, "conversations", conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
      const participantUsers = await Promise.all(participants.map(p => getUserById(p)));
      const participantNames = participantUsers.filter(p => p).map(p => p!.displayName || p!.email!);
      
      const updateData: { [key: string]: any } = {
        lastMessage: content,
        lastMessageTime: serverTimestamp(),
        participants: participants,
        participantNames: participantNames
      };

      // Increment count for all participants except the sender
      participants.forEach(participantId => {
        if (participantId !== sender.uid) {
          updateData[`unreadCounts.${participantId}`] = increment(1);
        }
      });

      await updateDoc(conversationRef, updateData);
    } else {
      const unreadCounts: { [key: string]: number } = {};
      participants.forEach(participantId => {
        unreadCounts[participantId] = participantId === sender.uid ? 0 : 1;
      });

      let conversationData: Omit<Conversation, 'id' | 'lastMessageTime'> & { lastMessageTime: any };
      if (isClassMessage) {
        const classDoc = await getDoc(doc(db, "classes", classId));
        const className = (classDoc.data() as Class)?.name || classId;
        const participantUsers = await Promise.all(participants.map(p => getUserById(p)));
        const participantNames = participantUsers.filter(p => p).map(p => p!.displayName || p!.email!);

        conversationData = {
          participants,
          participantNames,
          lastMessage: content,
          lastMessageTime: serverTimestamp(),
          unreadCounts,
          type: "class",
          className,
          classId: classId,
        };
      } else {
        const recipient = recipientId ? await getUserById(recipientId) : null;
        conversationData = {
          participants: participants,
          participantNames: [
            sender.displayName || sender.email,
            recipient?.displayName || recipient?.email || "Utilisateur supprimé",
          ].sort(),
          lastMessage: content,
          lastMessageTime: serverTimestamp(),
          unreadCounts,
          type: "direct",
        };
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
  recipientId?: string,
  classId?: string,
  callback?: (messages: Message[]) => void
): Unsubscribe | undefined => {
  let q;

  if (recipientId) {
    const conversationId = [userId, recipientId].sort().join('-');
    q = query(
      collection(db, "messages"),
      where("type", "==", "direct"),
      where("participants", "==", [userId, recipientId].sort()),
      orderBy("timestamp", "asc")
    );
  } else if (classId) {
    // Class messages
    q = query(
      collection(db, "messages"),
      where("classId", "==", classId),
      where("type", "==", "class"),
      orderBy("timestamp", "asc")
    );
  } else {
    return;
  }

  const unsubscribe = onSnapshot(q, (snapshot) => {
    try {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as Message);
      });
      if (callback) {
        callback(messages);
      }
    } catch (error) {
      console.error("Error processing messages snapshot:", error);
    }
  });

  return unsubscribe;
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
    try {
      const conversations: Conversation[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        lastMessageTime: doc.data().lastMessageTime?.toDate(),
      })) as Conversation[];
      callback(conversations);
    } catch (error) {
      console.error("Error processing conversations snapshot:", error);
      callback([]);
    }
  });
};

export const markConversationAsRead = async (conversationId: string, userId: string) => {
  try {
    const conversationRef = doc(db, "conversations", conversationId);
    // Use dot notation to update only the specific user's unread count.
    await updateDoc(conversationRef, {
      [`unreadCounts.${userId}`]: 0,
    });
  } catch (error) {
    console.error(
      "Erreur lors du marquage de la conversation comme lue:",
      error
    );
  }
};