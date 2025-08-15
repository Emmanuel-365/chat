"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AdminStats } from "./admin-stats"
import { UserManagement } from "./user-management"
import { ClassManagement } from "./class-management"
import { CourseManagement } from "./course-management"
import { MessageModeration } from "./message-moderation"
import { SystemSettings } from "./system-settings"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, BookOpen, MessageSquare, Settings, LogOut, Shield, BookCopy } from "lucide-react"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

type AdminTab = "stats" | "users" | "classes" | "courses" | "messages" | "settings";

export function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>("stats")
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab)
  }

  if (!user) return null

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Administration</h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">Bienvenue, {user.displayName}</p>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
        <Button
          variant={activeTab === "stats" ? "default" : "ghost"}
          className="w-full justify-start text-xs sm:text-sm"
          size="sm"
          onClick={() => handleTabChange("stats")}
        >
          <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3" />
          Statistiques
        </Button>

        <Button
          variant={activeTab === "users" ? "default" : "ghost"}
          className="w-full justify-start text-xs sm:text-sm"
          size="sm"
          onClick={() => handleTabChange("users")}
        >
          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3" />
          Gestion Utilisateurs
        </Button>

        <Button
          variant={activeTab === "classes" ? "default" : "ghost"}
          className="w-full justify-start text-xs sm:text-sm"
          size="sm"
          onClick={() => handleTabChange("classes")}
        >
          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3" />
          Gestion Classes
        </Button>

        <Button
          variant={activeTab === "courses" ? "default" : "ghost"}
          className="w-full justify-start text-xs sm:text-sm"
          size="sm"
          onClick={() => handleTabChange("courses")}
        >
          <BookCopy className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3" />
          Gestion Cours
        </Button>

        <Button
          variant={activeTab === "messages" ? "default" : "ghost"}
          className="w-full justify-start text-xs sm:text-sm"
          size="sm"
          onClick={() => handleTabChange("messages")}
        >
          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3" />
          Modération Messages
        </Button>

        <Button
          variant={activeTab === "settings" ? "default" : "ghost"}
          className="w-full justify-start text-xs sm:text-sm"
          size="sm"
          onClick={() => handleTabChange("settings")}
        >
          <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3" />
          Paramètres Système
        </Button>
      </div>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 space-y-1 sm:space-y-2 mt-auto">
        <Button
          variant="outline"
          className="w-full justify-start bg-transparent text-xs sm:text-sm"
          size="sm"
          onClick={handleBackToDashboard}
        >
          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3" />
          Retour au Chat
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
          size="sm"
          onClick={handleSignOut}
        >
          <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3" />
          Déconnexion
        </Button>
      </div>
    </div>
  )

  return (
    <PanelGroup direction="horizontal" className="h-screen w-full bg-gray-50 dark:bg-gray-900">
        <Panel defaultSize={25} minSize={20} maxSize={35}>
            <div className="flex h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col">
                <SidebarContent />
            </div>
        </Panel>
        <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-500 transition-colors" />
        <Panel>
            <div className="flex-1 h-full overflow-y-auto">
                {activeTab === "stats" && <AdminStats />}
                {activeTab === "users" && <UserManagement />}
                {activeTab === "classes" && <ClassManagement />}
                {activeTab === "courses" && <CourseManagement />}
                {activeTab === "messages" && <MessageModeration />}
                {activeTab === "settings" && <SystemSettings />}
            </div>
        </Panel>
    </PanelGroup>
  )
}
