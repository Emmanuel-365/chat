export type UserRole = "student" | "teacher" | "admin" | "staff"

export interface SchoolUser {
  uid: string
  email: string
  displayName: string
  role: UserRole
  classId?: string
  className?: string
  grade?: string
  profilePicture?: string
  isActive: boolean
  createdAt: Date
  lastSeen?: Date
}

export interface Class {
  id: string
  name: string
  grade: string
  teacherId: string
  teacherName: string
  studentIds: string[]
  createdAt: Date
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: UserRole
  recipientId?: string
  classId?: string
  content: string
  timestamp: Date
  isRead: boolean
  type: "direct" | "class" | "announcement"
}
