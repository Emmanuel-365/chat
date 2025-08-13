"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

  const initials = user.displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Gérez vos préférences et paramètres de compte</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profil</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profilePicture} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">{user.displayName}</h3>
                <RoleBadge role={user.role} />
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.role === "student" && user.studentProfile?.className && (
                <Badge variant="outline" className="text-xs">
                  {user.studentProfile.className}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayName">Nom d&apos;affichage</Label>
              <Input
                id="displayName"
                value={settings.displayName}
                onChange={(e) => setSettings((prev) => ({ ...prev, displayName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Messages directs</p>
              <p className="text-sm text-muted-foreground">Recevoir des notifications pour les messages privés</p>
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
            <div>
              <p className="font-medium">Annonces de classe</p>
              <p className="text-sm text-muted-foreground">Notifications pour les annonces importantes</p>
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
            <div>
              <p className="font-medium">Mentions</p>
              <p className="text-sm text-muted-foreground">Quand quelqu&apos;un vous mentionne</p>
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
            <div>
              <p className="font-medium">Notifications système</p>
              <p className="text-sm text-muted-foreground">Mises à jour et maintenance</p>
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
          <CardTitle className="flex items-center space-x-2">
            <Sun className="h-5 w-5" />
            <span>Apparence</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mode sombre</p>
              <p className="text-sm text-muted-foreground">Utiliser le thème sombre</p>
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
            <div>
              <p className="font-medium">Mode compact</p>
              <p className="text-sm text-muted-foreground">Interface plus dense</p>
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
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Confidentialité</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Statut en ligne</p>
              <p className="text-sm text-muted-foreground">Afficher quand vous êtes en ligne</p>
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
            <div>
              <p className="font-medium">Messages directs</p>
              <p className="text-sm text-muted-foreground">Autoriser les messages privés</p>
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
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>
    </div>
  )
}
