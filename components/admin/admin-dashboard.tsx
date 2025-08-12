"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AdminStats } from "./admin-stats"
import { UserManagement } from "./user-management"
import { ClassManagement } from "./class-management"
import { MessageModeration } from "./message-moderation"
import { SystemSettings } from "./system-settings"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, BookOpen, MessageSquare, Settings, LogOut, Shield } from "lucide-react"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "classes" | "messages" | "settings">("stats")
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  if (!user) return null

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="h-6 w-6 text-red-600" />
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Administration</h1>
          </div>
          <p className="text-sm text-muted-foreground">Bienvenue, {user.displayName}</p>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-2">
          <Button
            variant={activeTab === "stats" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("stats")}
          >
            <BarChart3 className="h-4 w-4 mr-3" />
            Statistiques
          </Button>

          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("users")}
          >
            <Users className="h-4 w-4 mr-3" />
            Gestion Utilisateurs
          </Button>

          <Button
            variant={activeTab === "classes" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("classes")}
          >
            <BookOpen className="h-4 w-4 mr-3" />
            Gestion Classes
          </Button>

          <Button
            variant={activeTab === "messages" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("messages")}
          >
            <MessageSquare className="h-4 w-4 mr-3" />
            Modération Messages
          </Button>

          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="h-4 w-4 mr-3" />
            Paramètres Système
          </Button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleBackToDashboard}>
            <MessageSquare className="h-4 w-4 mr-3" />
            Retour au Chat
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "stats" && <AdminStats />}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "classes" && <ClassManagement />}
        {activeTab === "messages" && <MessageModeration />}
        {activeTab === "settings" && <SystemSettings />}
      </div>
    </div>
  )
}
