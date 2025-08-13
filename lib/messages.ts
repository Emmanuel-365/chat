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
  getDocs,
  serverTimestamp,
  type Unsubscribe,
  setDoc,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Message, SchoolUser, Conversation } from "@/types/user";
import { getUserById } from "./contacts";

export const sendMessage = async (
  sender: SchoolUser,
  content: string,
  recipientId?: string,
  classId?: string
) => {
  try {
    const messageData = {
      senderId: sender.uid,
      senderDisplayName: sender.displayName || sender.email,
      senderRole: sender.role,
      content,
      timestamp: serverTimestamp(),
      isRead: false,
      type: recipientId ? "direct" : "class",
      ...(recipientId && { recipientId }),
      ...(classId && { classId }),
      ...(recipientId && { participants: [sender.uid, recipientId] }),
    };

    await addDoc(collection(db, "messages"), messageData);

    // Update conversation
    let conversationId: string;
    if (recipientId) {
      conversationId = [sender.uid, recipientId].sort().join("-");
    } else {
      conversationId = `class-${classId}`;
    }

    const conversationRef = doc(db, "conversations", conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
      await updateDoc(conversationRef, {
        lastMessage: content,
        lastMessageTime: serverTimestamp(),
        unreadCount: increment(1),
      });
    } else {
      const recipient = recipientId ? await getUserById(recipientId) : null;
      const conversationData = {
        participants: recipientId ? [sender.uid, recipientId] : [sender.uid],
        participantNames: recipientId
          ? [sender.displayName || sender.email, (recipient?.displayName || recipient?.email) ?? "Utilisateur supprimé"]
          : [sender.displayName || sender.email],
        lastMessage: content,
        lastMessageTime: serverTimestamp(),
        unreadCount: 1,
        type: recipientId ? "direct" : "class",
        ...(classId && { className: classId }),
      };
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
    q = query(
      collection(db, "messages"),
      where("type", "==", "direct"),
      where("participants", "in", [[userId, recipientId], [recipientId, userId]]),
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

  return onSnapshot(q, (snapshot) => {
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
      // Optionally, you might want to notify the UI about the error
    }
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

export const markConversationAsRead = async (conversationId: string) => {
  try {
    await updateDoc(doc(db, "conversations", conversationId), {
      unreadCount: 0,
    });
  } catch (error) {
    console.error(
      "Erreur lors du marquage de la conversation comme lue:",
      error
    );
  }
};