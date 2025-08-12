"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Edit, Trash2, UserCheck, UserX, UserPlus } from "lucide-react"
import { getAllUsers } from "@/lib/contacts"
import { updateUserRole, toggleUserStatus, deleteUser } from "@/lib/admin"
import { RoleBadge } from "@/components/auth/role-badge"
import { UserCreation } from "./user-creation"
import type { SchoolUser } from "@/types/user"

export function UserManagement() {
  const [users, setUsers] = useState<SchoolUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<SchoolUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "teacher" | "admin">("all")
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<SchoolUser | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingRole, setEditingRole] = useState<"student" | "teacher" | "admin">("student")
  const [actionLoading, setActionLoading] = useState(false)
  const [showCreateUser, setShowCreateUser] = useState(false)

  useEffect(() => {
    const loadUsers = async () => {
      const allUsers = await getAllUsers()
      setUsers(allUsers)
      setFilteredUsers(allUsers)
      setLoading(false)
    }

    loadUsers()
  }, [])

  useEffect(() => {
    let filtered = users

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.className && user.className.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filtrer par rôle
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter])

  const handleUpdateRole = async () => {
    if (!selectedUser) return

    setActionLoading(true)
    const success = await updateUserRole(selectedUser.uid, editingRole)

    if (success) {
      // Mettre à jour la liste locale
      const updatedUsers = users.map((user) => (user.uid === selectedUser.uid ? { ...user, role: editingRole } : user))
      setUsers(updatedUsers)
      setShowEditDialog(false)
      setSelectedUser(null)
    }

    setActionLoading(false)
  }

  const handleToggleStatus = async (user: SchoolUser) => {
    setActionLoading(true)
    const success = await toggleUserStatus(user.uid, !user.isActive)

    if (success) {
      const updatedUsers = users.map((u) => (u.uid === user.uid ? { ...u, isActive: !u.isActive } : u))
      setUsers(updatedUsers)
    }

    setActionLoading(false)
  }

  const handleDeleteUser = async (user: SchoolUser) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.displayName} ?`)) {
      return
    }

    setActionLoading(true)
    const success = await deleteUser(user.uid)

    if (success) {
      const updatedUsers = users.filter((u) => u.uid !== user.uid)
      setUsers(updatedUsers)
    }

    setActionLoading(false)
  }

  const UserCard = ({ user }: { user: SchoolUser }) => {
    const initials = user.displayName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()

    const isOnline = user.lastSeen && new Date().getTime() - user.lastSeen.getTime() < 5 * 60 * 1000

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={user.profilePicture || "/placeholder.svg"} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                {isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-medium truncate">{user.displayName}</p>
                  {!user.isActive && <Badge variant="destructive">Inactif</Badge>}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <RoleBadge role={user.role} />
                  {user.className && (
                    <Badge variant="outline" className="text-xs">
                      {user.className}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {user.lastSeen ? `Dernière connexion: ${user.lastSeen.toLocaleDateString()}` : "Jamais connecté"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedUser(user)
                  setEditingRole(user.role)
                  setShowEditDialog(true)
                }}
                disabled={actionLoading}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={user.isActive ? "destructive" : "default"}
                onClick={() => handleToggleStatus(user)}
                disabled={actionLoading}
              >
                {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user)} disabled={actionLoading}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les comptes utilisateurs de votre plateforme</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{filteredUsers.length} utilisateurs</Badge>
          <Button onClick={() => setShowCreateUser(!showCreateUser)}>
            <UserPlus className="h-4 w-4 mr-2" />
            {showCreateUser ? "Masquer" : "Inviter un utilisateur"}
          </Button>
        </div>
      </div>

      {showCreateUser && (
        <div className="mb-6">
          <UserCreation />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou classe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="student">Étudiants</SelectItem>
            <SelectItem value="teacher">Professeurs</SelectItem>
            <SelectItem value="admin">Administrateurs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            filteredUsers.map((user) => <UserCard key={user.uid} user={user} />)
          )}
        </div>
      </ScrollArea>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={selectedUser.profilePicture || "/placeholder.svg"} />
                  <AvatarFallback>
                    {selectedUser.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.displayName}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Rôle</label>
                <Select value={editingRole} onValueChange={(value: any) => setEditingRole(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Étudiant</SelectItem>
                    <SelectItem value="teacher">Professeur</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <AlertDescription>
                  Attention: Changer le rôle d'un utilisateur peut affecter ses permissions et son accès aux
                  fonctionnalités.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleUpdateRole}
                  disabled={actionLoading || editingRole === selectedUser.role}
                  className="flex-1"
                >
                  {actionLoading ? "Mise à jour..." : "Mettre à jour"}
                </Button>
                <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
