export type UserRole = "student" | "teacher" | "admin" | "staff";

export interface StudentProfile {
  classId?: string;
  className?: string;
  grade?: string;
}

export interface SchoolUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  profilePicture?: string;
  isActive: boolean;
  createdAt: Date;
  lastSeen?: Date;
  studentProfile?: StudentProfile;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  teacherId: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  senderDisplayName: string;
  senderRole: UserRole;
  recipientId?: string;
  classId?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: "direct" | "class" | "announcement";
  participants: string[];
}

export interface Invitation {
  id: string;
  email: string;
  displayName: string; // Added displayName property
  role: UserRole;
  status: "pending" | "accepted";
  createdAt: Date;
  expiresAt?: Date; // Added expiresAt property
  createdBy: string;
  studentProfile?: StudentProfile;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  type: "direct" | "class";
  className?: string;
  classId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "message" | "class_announcement" | "system" | "mention";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  data?: {
    messageId?: string;
    senderId?: string;
    senderName?: string;
    conversationId?: string;
  };
}
