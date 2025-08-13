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
import { getContactsForUser, searchUsers } from "@/lib/contacts"
import { RoleBadge } from "@/components/auth/role-badge"
import type { SchoolUser } from "@/types/user"

interface ContactsTabProps {
  currentUser: SchoolUser
  onStartConversation: (userId: string) => void
}

export function ContactsTab({ currentUser, onStartConversation }: ContactsTabProps) {
  const [contacts, setContacts] = useState<{ [key: string]: SchoolUser[] }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SchoolUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true);
      const userContacts = await getContactsForUser(currentUser);
      setContacts(userContacts);
      setLoading(false);
    };

    loadContacts();
  }, [currentUser]);

  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim()) {
        const results = await searchUsers(searchTerm, currentUser);
        setSearchResults(results.filter((user) => user.uid !== currentUser.uid));
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, currentUser]);

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
        <Tabs defaultValue={Object.keys(contacts)[0] || 'all'} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-1 p-1">
            {Object.entries(contacts).map(([role, users]) => (
              <TabsTrigger
                key={role}
                value={role}
                className="flex flex-col items-center justify-center gap-1 text-xs sm:text-sm p-2 sm:p-3 h-auto min-h-[60px] sm:min-h-[50px]"
              >
                {role === 'students' && <GraduationCap className="h-4 w-4 shrink-0" />}
                {role === 'teachers' && <Users className="h-4 w-4 shrink-0" />}
                {role === 'admins' && <Shield className="h-4 w-4 shrink-0" />}
                {role === 'all' && <Users className="h-4 w-4 shrink-0" />}
                {role === 'classmates' && <Users className="h-4 w-4 shrink-0" />}
                {role === 'teacher' && <GraduationCap className="h-4 w-4 shrink-0" />}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="font-medium capitalize">{role === 'classmates' ? 'Ma Classe' : role}</span>
                  <span className="text-xs opacity-75">({users.length})</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(contacts).map(([role, users]) => (
            <TabsContent key={role} value={role} className="mt-4">
              <ContactList contacts={users} emptyMessage={`Aucun contact trouvé dans "${role}"`} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
