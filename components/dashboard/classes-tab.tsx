"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Users, MessageCircle, BookOpen } from "lucide-react"
import { getClasses, getClassesByTeacher, createClass } from "@/lib/classes"
import { getUsersByClass } from "@/lib/contacts"
import type { Class, SchoolUser } from "@/types/user"

interface ClassesTabProps {
  currentUser: SchoolUser
  onStartClassConversation: (classId: string) => void
}

export function ClassesTab({ currentUser, onStartClassConversation }: ClassesTabProps) {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newClassName, setNewClassName] = useState("")
  const [newClassGrade, setNewClassGrade] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const loadClasses = async () => {
      setLoading(true)

      let classesData: Class[]
      if (currentUser.role === "admin") {
        classesData = await getClasses()
      } else if (currentUser.role === "teacher") {
        classesData = await getClassesByTeacher(currentUser.uid)
      } else {
        // Pour les étudiants, on récupère toutes les classes mais on pourrait filtrer
        classesData = await getClasses()
      }

      setClasses(classesData)
      setLoading(false)
    }

    loadClasses()
  }, [currentUser])

  const handleCreateClass = async () => {
    if (!newClassName.trim() || !newClassGrade.trim()) return

    setCreating(true)
    const { success } = await createClass(newClassName.trim(), newClassGrade, currentUser.uid, currentUser.displayName)

    if (success) {
      setNewClassName("")
      setNewClassGrade("")
      setShowCreateDialog(false)

      // Recharger les classes
      const updatedClasses =
        currentUser.role === "admin" ? await getClasses() : await getClassesByTeacher(currentUser.uid)
      setClasses(updatedClasses)
    }

    setCreating(false)
  }

  const ClassCard = ({ classData }: { classData: Class }) => {
    const [students, setStudents] = useState<SchoolUser[]>([])
    const [studentsLoaded, setStudentsLoaded] = useState(false)

    const loadStudents = async () => {
      if (!studentsLoaded) {
        const classStudents = await getUsersByClass(classData.id)
        setStudents(classStudents)
        setStudentsLoaded(true)
      }
    }

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">{classData.name}</CardTitle>
            </div>
            <Badge variant="secondary">{classData.grade}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Professeur:</span>
            <span className="font-medium">{classData.teacherName}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Étudiants:</span>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{classData.studentIds?.length || 0}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={() => onStartClassConversation(classData.id)} className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              Discussion
            </Button>
            <Button size="sm" variant="outline" onClick={loadStudents} className="flex-1 bg-transparent">
              <Users className="h-4 w-4 mr-2" />
              Voir étudiants
            </Button>
          </div>

          {studentsLoaded && students.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm font-medium mb-2">Étudiants de la classe:</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {students.map((student) => (
                  <div key={student.uid} className="text-xs text-muted-foreground">
                    {student.displayName}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Classes</h2>
        {(currentUser.role === "admin" || currentUser.role === "teacher") && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer une classe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle classe</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="className">Nom de la classe</Label>
                  <Input
                    id="className"
                    placeholder="ex: 6ème A, Terminale S..."
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="classGrade">Niveau</Label>
                  <Select value={newClassGrade} onValueChange={setNewClassGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6eme">6ème</SelectItem>
                      <SelectItem value="5eme">5ème</SelectItem>
                      <SelectItem value="4eme">4ème</SelectItem>
                      <SelectItem value="3eme">3ème</SelectItem>
                      <SelectItem value="seconde">Seconde</SelectItem>
                      <SelectItem value="premiere">Première</SelectItem>
                      <SelectItem value="terminale">Terminale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateClass}
                    disabled={creating || !newClassName.trim() || !newClassGrade}
                    className="flex-1"
                  >
                    {creating ? "Création..." : "Créer"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Classes List */}
      <ScrollArea className="h-[500px]">
        <div className="grid gap-4">
          {classes.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {currentUser.role === "student" ? "Aucune classe disponible" : "Aucune classe créée"}
              </p>
              {(currentUser.role === "admin" || currentUser.role === "teacher") && (
                <p className="text-sm text-muted-foreground mt-2">Créez votre première classe pour commencer</p>
              )}
            </div>
          ) : (
            classes.map((classData) => <ClassCard key={classData.id} classData={classData} />)
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
