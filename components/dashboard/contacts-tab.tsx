"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MessageCircle, Users, GraduationCap, Shield } from "lucide-react"
import { getAllUsers, getUsersByRole, searchUsers } from "@/lib/contacts"
import { RoleBadge } from "@/components/auth/role-badge"
import type { SchoolUser } from "@/types/user"

interface ContactsTabProps {
  currentUser: SchoolUser
  onStartConversation: (userId: string) => void
}

export function ContactsTab({ currentUser, onStartConversation }: ContactsTabProps) {
  const [allContacts, setAllContacts] = useState<SchoolUser[]>([])
  const [students, setStudents] = useState<SchoolUser[]>([])
  const [teachers, setTeachers] = useState<SchoolUser[]>([])
  const [admins, setAdmins] = useState<SchoolUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<SchoolUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true)

      const [allUsers, studentUsers, teacherUsers, adminUsers] = await Promise.all([
        getAllUsers(currentUser.uid),
        getUsersByRole("student", currentUser.uid),
        getUsersByRole("teacher", currentUser.uid),
        getUsersByRole("admin", currentUser.uid),
      ])

      setAllContacts(allUsers)
      setStudents(studentUsers)
      setTeachers(teacherUsers)
      setAdmins(adminUsers)
      setLoading(false)
    }

    loadContacts()
  }, [currentUser.uid])

  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim()) {
        const results = await searchUsers(searchTerm)
        setSearchResults(results.filter((user) => user.uid !== currentUser.uid))
      } else {
        setSearchResults([])
      }
    }

    const debounceTimer = setTimeout(performSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm, currentUser.uid])

  const ContactCard = ({ user }: { user: SchoolUser }) => {
    const initials = user.displayName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()

    const isOnline = user.lastSeen && new Date().getTime() - user.lastSeen.getTime() < 5 * 60 * 1000

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="relative shrink-0">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarImage src={user.profilePicture || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs sm:text-sm">{initials}</AvatarFallback>
                </Avatar>
                {isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm sm:text-base">{user.displayName}</p>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                  <RoleBadge role={user.role} />
                  {user.role === "student" && user.studentProfile?.className && (
                    <Badge variant="outline" className="text-xs">
                      {user.studentProfile.className}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{user.email}</p>
              </div>
            </div>
            <Button size="sm" onClick={() => onStartConversation(user.uid)} className="shrink-0 ml-2">
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline ml-1">Message</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const ContactList = ({ contacts, emptyMessage }: { contacts: SchoolUser[]; emptyMessage: string }) => (
    <ScrollArea className="h-[300px] sm:h-[400px]">
      <div className="space-y-2 sm:space-y-3 p-1">
        {contacts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">{emptyMessage}</p>
          </div>
        ) : (
          contacts.map((contact) => <ContactCard key={contact.uid} user={contact} />)
        )}
      </div>
    </ScrollArea>
  )

  if (loading) {
    return (
      <div className="p-3 sm:p-4">
        <div className="animate-pulse space-y-3 sm:space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
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
    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-sm sm:text-base"
        />
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div>
          <h3 className="font-medium mb-3 text-sm sm:text-base">Résultats de recherche ({searchResults.length})</h3>
          <ContactList contacts={searchResults} emptyMessage="Aucun contact trouvé" />
        </div>
      )}

      {/* Contacts by Role */}
      {!searchTerm && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger
              value="all"
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Tous</span>
              <span className="sm:hidden">Tous</span>
              <span className="text-xs">({allContacts.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2"
            >
              <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Étudiants</span>
              <span className="sm:hidden">Étud.</span>
              <span className="text-xs">({students.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="teachers"
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Professeurs</span>
              <span className="sm:hidden">Prof.</span>
              <span className="text-xs">({teachers.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="admins"
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2"
            >
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Admins</span>
              <span className="sm:hidden">Adm.</span>
              <span className="text-xs">({admins.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ContactList contacts={allContacts} emptyMessage="Aucun contact disponible" />
          </TabsContent>

          <TabsContent value="students" className="mt-4">
            <ContactList contacts={students} emptyMessage="Aucun étudiant trouvé" />
          </TabsContent>

          <TabsContent value="teachers" className="mt-4">
            <ContactList contacts={teachers} emptyMessage="Aucun professeur trouvé" />
          </TabsContent>

          <TabsContent value="admins" className="mt-4">
            <ContactList contacts={admins} emptyMessage="Aucun administrateur trouvé" />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
