"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { EditableAvatar } from "@/components/auth/editable-avatar";
import { Badge } from "@/components/ui/badge"
import { User, Bell, Sun, Shield, Save } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { RoleBadge } from "@/components/auth/role-badge"

export function UserSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    notifications: {
      messages: true,
      classAnnouncements: true,
      mentions: true,
      system: false,
    },
    appearance: {
      darkMode: false,
      compactMode: false,
    },
    privacy: {
      showOnlineStatus: true,
      allowDirectMessages: true,
    },
  })

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Ici on sauvegarderait les paramètres dans Firebase
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulation
    setSaving(false)
  }

  if (!user) return null

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Gérez vos préférences et paramètres de compte</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Profil</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <EditableAvatar user={user} />
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2">
                <h3 className="font-medium text-sm sm:text-base">{user.displayName}</h3>
                <RoleBadge role={user.role} />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{user.email}</p>
              {user.role === "student" && user.studentProfile?.className && (
                <Badge variant="outline" className="text-xs">
                  {user.studentProfile.className}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayName" className="text-sm">
                Nom d&apos;affichage
              </Label>
              <Input
                id="displayName"
                value={settings.displayName}
                onChange={(e) => setSettings((prev) => ({ ...prev, displayName: e.target.value }))}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))}
                disabled
                className="text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium text-sm sm:text-base">Messages directs</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Recevoir des notifications pour les messages privés
              </p>
            </div>
            <Switch
              checked={settings.notifications.messages}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, messages: checked },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium text-sm sm:text-base">Annonces de classe</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Notifications pour les annonces importantes</p>
            </div>
            <Switch
              checked={settings.notifications.classAnnouncements}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, classAnnouncements: checked },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium text-sm sm:text-base">Mentions</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Quand quelqu&apos;un vous mentionne</p>
            </div>
            <Switch
              checked={settings.notifications.mentions}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, mentions: checked },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium text-sm sm:text-base">Notifications système</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Mises à jour et maintenance</p>
            </div>
            <Switch
              checked={settings.notifications.system}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, system: checked },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Apparence</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium text-sm sm:text-base">Mode sombre</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Utiliser le thème sombre</p>
            </div>
            <Switch
              checked={settings.appearance.darkMode}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  appearance: { ...prev.appearance, darkMode: checked },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium text-sm sm:text-base">Mode compact</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Interface plus dense</p>
            </div>
            <Switch
              checked={settings.appearance.compactMode}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  appearance: { ...prev.appearance, compactMode: checked },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Confidentialité</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium text-sm sm:text-base">Statut en ligne</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Afficher quand vous êtes en ligne</p>
            </div>
            <Switch
              checked={settings.privacy.showOnlineStatus}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  privacy: { ...prev.privacy, showOnlineStatus: checked },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium text-sm sm:text-base">Messages directs</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Autoriser les messages privés</p>
            </div>
            <Switch
              checked={settings.privacy.allowDirectMessages}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  privacy: { ...prev.privacy, allowDirectMessages: checked },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-center sm:justify-end">
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>
    </div>
  )
}
