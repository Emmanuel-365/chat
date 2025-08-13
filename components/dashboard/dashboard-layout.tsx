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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MessageCircle, Users, Settings, LogOut, BookOpen, Shield, Menu, X } from "lucide-react"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function DashboardLayout() {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"messages" | "contacts" | "classes" | "settings">("messages")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleNewConversationClick = () => {
    setActiveTab("contacts")
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleStartConversation = (userId: string) => {
    // Créer l'ID de conversation pour une conversation directe
    const conversationId = [user!.uid, userId].sort().join("-")
    setSelectedConversation(conversationId)
    setActiveTab("messages")
    setSidebarOpen(false) // Fermer la sidebar sur mobile
  }

  const handleStartClassConversation = (classId: string) => {
    // Créer l'ID de conversation pour une classe
    const conversationId = `class-${classId}`
    setSelectedConversation(conversationId)
    setActiveTab("messages")
    setSidebarOpen(false) // Fermer la sidebar sur mobile
  }

  const handleTabChange = (tab: "messages" | "contacts" | "classes" | "settings") => {
    setActiveTab(tab)
    setSidebarOpen(false) // Fermer la sidebar sur mobile après sélection
  }

  if (!user) return null

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">EcoleChat</h1>
          <div className="flex items-center space-x-1 sm:space-x-2">
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
            {/* Bouton fermer pour mobile */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <UserProfile user={user} />
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-2 md:flex border-b border-gray-200 dark:border-gray-700">
        <Button
          variant={activeTab === "messages" ? "default" : "ghost"}
          size="sm"
          className="rounded-none text-xs sm:text-sm px-2 sm:px-3"
          onClick={() => handleTabChange("messages")}
        >
          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Messages</span>
          <span className="sm:hidden">Msg</span>
        </Button>
        <Button
          variant={activeTab === "contacts" ? "default" : "ghost"}
          size="sm"
          className="rounded-none text-xs sm:text-sm px-2 sm:px-3"
          onClick={() => handleTabChange("contacts")}
        >
          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Contacts</span>
          <span className="sm:hidden">Cont</span>
        </Button>
        <Button
          variant={activeTab === "classes" ? "default" : "ghost"}
          size="sm"
          className="rounded-none text-xs sm:text-sm px-2 sm:px-3"
          onClick={() => handleTabChange("classes")}
        >
          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Classes</span>
          <span className="sm:hidden">Cls</span>
        </Button>
        <Button
          variant={activeTab === "settings" ? "default" : "ghost"}
          size="sm"
          className="rounded-none text-xs sm:text-sm px-2 sm:px-3"
          onClick={() => handleTabChange("settings")}
        >
          <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Paramètres</span>
          <span className="sm:hidden">Param</span>
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "messages" && (
          <ConversationList
            userId={user.uid}
            selectedConversation={selectedConversation}
            onSelectConversation={(id) => {
              setSelectedConversation(id)
              setSidebarOpen(false)
            }}
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
  )

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-80 lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-full sm:w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">EcoleChat</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Chat Content */}
        {selectedConversation ? (
          <ChatWindow conversationId={selectedConversation} currentUser={user} />
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="p-6 sm:p-8 text-center max-w-md mx-auto">
              <MessageCircle className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Sélectionnez une conversation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choisissez une conversation dans la liste pour commencer à discuter
              </p>
              <Button className="md:hidden" onClick={() => setSidebarOpen(true)}>
                Voir les conversations
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
