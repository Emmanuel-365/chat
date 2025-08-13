"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AdminStats } from "./admin-stats"
import { UserManagement } from "./user-management"
import { ClassManagement } from "./class-management"
import { CourseManagement } from "./course-management" // Importation
import { MessageModeration } from "./message-moderation"
import { SystemSettings } from "./system-settings"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { BarChart3, Users, BookOpen, MessageSquare, Settings, LogOut, Shield, Menu, X, BookCopy } from "lucide-react" // Importation
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"

type AdminTab = "stats" | "users" | "classes" | "courses" | "messages" | "settings"; // Mise à jour du type

export function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>("stats") // Utilisation du nouveau type
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  const handleTabChange = (tab: AdminTab) => { // Mise à jour du type
    setActiveTab(tab)
    setSidebarOpen(false) // Fermer la sidebar sur mobile
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
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">Bienvenue, {user.displayName}</p>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2">
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

        {/* Bouton Gestion Cours */}
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
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 space-y-1 sm:space-y-2">
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
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 lg:w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-full sm:w-80 p-0">
          <SheetTitle className="sr-only">Menu d'administration</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-600" />
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Administration</h1>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "stats" && <AdminStats />}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "classes" && <ClassManagement />}
          {activeTab === "courses" && <CourseManagement />}
          {activeTab === "messages" && <MessageModeration />}
          {activeTab === "settings" && <SystemSettings />}
        </div>
      </div>
    </div>
  )
}
