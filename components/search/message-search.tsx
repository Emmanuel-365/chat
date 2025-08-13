import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MessageCircle, Calendar } from "lucide-react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getUserById } from "@/lib/contacts";
import { RoleBadge } from "@/components/auth/role-badge";
import type { Message, SchoolUser } from "@/types/user";

interface MessageSearchProps {
  userId: string;
  onSelectMessage?: (message: Message) => void;
}

export function MessageSearch({ userId, onSelectMessage }: MessageSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const searchMessages = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Recherche dans les messages où l'utilisateur est impliqué
      const messagesQuery = query(
        collection(db, "messages"),
        orderBy("timestamp", "desc")
      );

      const snapshot = await getDocs(messagesQuery);
      const messages: Message[] = [];
      const userCache = new Map<string, SchoolUser>();

      const getCachedUser = async (uid: string) => {
        if (userCache.has(uid)) {
          return userCache.get(uid);
        }
        const user = await getUserById(uid);
        if (user) {
          userCache.set(uid, user);
        }
        return user;
      };

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const message = {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as Message;

        // Vérifier si l'utilisateur est impliqué et si le message contient le terme de recherche
        const isInvolved =
          message.senderId === userId ||
          message.recipientId === userId ||
          (message.type === "class" && message.classId);

        const containsSearchTerm = message.content
          .toLowerCase()
          .includes(term.toLowerCase());

        if (isInvolved && containsSearchTerm) {
          const sender = await getCachedUser(message.senderId);
          messages.push({
            ...message,
            senderDisplayName: sender?.displayName || "Unknown User",
            senderRole: sender?.role || "student",
          });
        }
      }

      setSearchResults(messages.slice(0, 50)); // Limiter à 50 résultats
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchMessages(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, userId, searchMessages]);

  const formatTime = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text;

    const regex = new RegExp(`(${term})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Search className="h-4 w-4 mr-2" />
          
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Recherche de messages</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans vos messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Results */}
          <ScrollArea className="h-96">
            {loading ? (
              <div className="p-4">
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8">
                {searchTerm ? (
                  <>
                    <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Aucun message trouvé pour &quot;{searchTerm}&quot;</p>
                  </>
                ) : (
                  <>
                    <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Tapez pour rechercher dans vos messages</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((message) => {
                  const initials = message.senderDisplayName
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .toUpperCase();

                  return (
                    <Card
                      key={message.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        onSelectMessage?.(message);
                        setOpen(false);
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{message.senderDisplayName}</span>
                              <RoleBadge role={message.senderRole} />
                              <Badge variant="outline" className="text-xs">
                                {message.type === "direct" ? "Direct" : "Classe"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                              {highlightSearchTerm(message.content, searchTerm)}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatTime(message.timestamp)}</span>
                              </div>
                              {message.type === "class" && message.classId && (
                                <div className="flex items-center space-x-1">
                                  <MessageCircle className="h-3 w-3" />
                                  <span>Classe {message.classId}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {searchResults.length > 0 && (
            <div className="text-center text-xs text-muted-foreground">
              {searchResults.length} résultat{searchResults.length > 1 ? "s" : ""} trouvé
              {searchResults.length > 1 ? "s" : ""}
              {searchResults.length === 50 && " (limité à 50)"}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}