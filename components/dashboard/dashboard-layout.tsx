"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { ConversationList } from "./conversation-list"
import { ChatWindow } from "./chat-window"
import { UserProfile } from "./user-profile"
import { ContactsTab } from "./contacts-tab"
import { ClassesTab } from "./classes-tab"
import { CoursesTab } from "./courses-tab" // Ajout
import { UserSettings } from "@/components/settings/user-settings"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { MessageSearch } from "@/components/search/message-search"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageCircle, Users, Settings, LogOut, BookOpen, Shield, BookCopy } from "lucide-react" // Ajout
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"

type DashboardTab = "messages" | "contacts" | "classes" | "courses" | "settings"; // Ajout

export function DashboardLayout() {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<DashboardTab>("messages")
  const router = useRouter()

  const handleNewConversationClick = () => {
    setActiveTab("contacts")
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleStartConversation = (userId: string) => {
    const conversationId = [user!.uid, userId].sort().join("-")
    setSelectedConversation(conversationId)
    setActiveTab("messages")
  }

  const handleStartClassConversation = (classId: string) => {
    const conversationId = `class-${classId}`
    setSelectedConversation(conversationId)
    setActiveTab("messages")
  }

  // Ajout de la nouvelle fonction
  const handleStartCourseConversation = (courseId: string) => {
    const conversationId = `course-${courseId}`;
    setSelectedConversation(conversationId);
    setActiveTab("messages");
  }

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab)
  }

  if (!user) return null

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">EcoleChat</h1>
          <div className="flex items-center space-x-1 overflow-hidden">
            <div className="flex-shrink-0">
              <NotificationCenter userId={user.uid} />
            </div>
            <div className="flex-shrink-0">
              <MessageSearch userId={user.uid} />
            </div>
            {user.role === "admin" && (
              <div className="flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => router.push("/admin")}>
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            )}
            <div className="flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
        <UserProfile user={user} />
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-2 md:flex border-b border-gray-200 dark:border-gray-700">
        <Button
          variant={activeTab === "messages" ? "default" : "ghost"}
          size="sm"
          className="rounded-none text-xs sm:text-sm px-1 sm:px-2 md:px-3 flex-1 min-w-0"
          onClick={() => handleTabChange("messages")}
        >
          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
          <span className="truncate">Messages</span>
        </Button>
        <Button
          variant={activeTab === "contacts" ? "default" : "ghost"}
          size="sm"
          className="rounded-none text-xs sm:text-sm px-1 sm:px-2 md:px-3 flex-1 min-w-0"
          onClick={() => handleTabChange("contacts")}
        >
          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
          <span className="truncate">Contacts</span>
        </Button>
        <Button
          variant={activeTab === "classes" ? "default" : "ghost"}
          size="sm"
          className="rounded-none text-xs sm:text-sm px-1 sm:px-2 md:px-3 flex-1 min-w-0"
          onClick={() => handleTabChange("classes")}
        >
          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
          <span className="truncate">Classes</span>
        </Button>
        {/* Ajout de l'onglet Cours */}
        {(user.role === 'student' || user.role === 'teacher') && (
            <Button
                variant={activeTab === "courses" ? "default" : "ghost"}
                size="sm"
                className="rounded-none text-xs sm:text-sm px-1 sm:px-2 md:px-3 flex-1 min-w-0"
                onClick={() => handleTabChange("courses")}
            >
                <BookCopy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                <span className="truncate">Cours</span>
            </Button>
        )}
        <Button
          variant={activeTab === "settings" ? "default" : "ghost"}
          size="sm"
          className="rounded-none text-xs sm:text-sm px-1 sm:px-2 md:px-3 flex-1 min-w-0"
          onClick={() => handleTabChange("settings")}
        >
          <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
          <span className="truncate">Paramètres</span>
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "messages" && (
          <ConversationList
            userId={user.uid}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            onNewConversationClick={handleNewConversationClick}
          />
        )}
        {activeTab === "contacts" && <ContactsTab currentUser={user} onStartConversation={handleStartConversation} />}
        {activeTab === "classes" && (
          <ClassesTab currentUser={user} onStartClassConversation={handleStartClassConversation} />
        )}
        {activeTab === "courses" && (
          <CoursesTab currentUser={user} onStartCourseConversation={handleStartCourseConversation} />
        )}
        {activeTab === "settings" && (
          <div className="h-full overflow-y-auto">
            <UserSettings />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Static Sidebar */}
      <div className="flex w-80 lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation}
            currentUser={user}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="p-6 sm:p-8 text-center max-w-md mx-auto">
              <MessageCircle className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Sélectionnez une conversation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choisissez une conversation dans la liste pour commencer à discuter.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
