"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { ConversationList } from "./conversation-list"
import { ChatWindow } from "./chat-window"
import { UserProfile } from "./user-profile"
import { ContactsTab } from "./contacts-tab"
import { ClassesTab } from "./classes-tab"
import { UserSettings } from "@/components/settings/user-settings"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { MessageSearch } from "@/components/search/message-search"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageCircle, Users, Settings, LogOut, BookOpen, Shield } from "lucide-react"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function DashboardLayout() {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"messages" | "contacts" | "classes" | "settings">("messages")
  const router = useRouter()

  const handleNewConversationClick = () => {
    setActiveTab("contacts");
  };

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleStartConversation = (userId: string) => {
    // Créer l'ID de conversation pour une conversation directe
    const conversationId = [user!.uid, userId].sort().join("-")
    setSelectedConversation(conversationId)
    setActiveTab("messages")
  }

  const handleStartClassConversation = (classId: string) => {
    // Créer l'ID de conversation pour une classe
    const conversationId = `class-${classId}`
    setSelectedConversation(conversationId)
    setActiveTab("messages")
  }

  if (!user) return null

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">EcoleChat</h1>
            <div className="flex items-center space-x-2">
              {/* Ajout du centre de notifications */}
              <NotificationCenter userId={user.uid} />
              {/* Ajout de la recherche de messages */}
              <MessageSearch userId={user.uid} />
              {/* Ajout du bouton admin pour les administrateurs */}
              {user.role === "admin" && (
                <Button variant="ghost" size="sm" onClick={() => router.push("/admin")}>
                  <Shield className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <UserProfile user={user} />
        </div>

        {/* Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <Button
            variant={activeTab === "messages" ? "default" : "ghost"}
            size="sm"
            className="flex-1 rounded-none"
            onClick={() => setActiveTab("messages")}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Messages
          </Button>
          <Button
            variant={activeTab === "contacts" ? "default" : "ghost"}
            size="sm"
            className="flex-1 rounded-none"
            onClick={() => setActiveTab("contacts")}
          >
            <Users className="h-4 w-4 mr-2" />
            Contacts
          </Button>
          <Button
            variant={activeTab === "classes" ? "default" : "ghost"}
            size="sm"
            className="flex-1 rounded-none"
            onClick={() => setActiveTab("classes")}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Classes
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            size="sm"
            className="flex-1 rounded-none"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
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
          {activeTab === "settings" && (
            <div className="h-full overflow-y-auto">
              <UserSettings />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatWindow conversationId={selectedConversation} currentUser={user} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Card className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sélectionnez une conversation</h3>
              <p className="text-muted-foreground">
                Choisissez une conversation dans la liste pour commencer à discuter
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
