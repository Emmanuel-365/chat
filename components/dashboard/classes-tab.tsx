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
import { getClasses, createClass, getClassById } from "@/lib/classes"
import { getUsersByClass } from "@/lib/contacts"
import { getCoursesByTeacher } from "@/lib/courses"
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

      let classesData: Class[] = []
      if (currentUser.role === "admin") {
        classesData = await getClasses()
      } else if (currentUser.role === "teacher") {
        // Un professeur voit toutes les classes dans lesquelles il donne un cours.
        const courses = await getCoursesByTeacher(currentUser.uid);
        const classIds = [...new Set(courses.flatMap(c => c.classIds))];
        const classPromises = classIds.map(id => getClassById(id));
        classesData = (await Promise.all(classPromises)).filter(c => c !== null) as Class[];
      } else if (currentUser.role === "student" && currentUser.studentProfile?.classId) {
        const studentClass = await getClassById(currentUser.studentProfile.classId)
        if (studentClass) {
          classesData = [studentClass]
        }
      }

      setClasses(classesData)
      setLoading(false)
    }

    loadClasses()
  }, [currentUser])

  const handleCreateClass = async () => {
    if (!newClassName.trim() || !newClassGrade.trim()) return

    setCreating(true)
    // Appel à la fonction createClass mise à jour
    const { success } = await createClass(newClassName.trim(), newClassGrade)

    if (success) {
      setNewClassName("")
      setNewClassGrade("")
      setShowCreateDialog(false)

      // Recharger les classes
      const updatedClasses = await getClasses()
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
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
              <CardTitle className="text-base sm:text-lg truncate">{classData.name}</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs shrink-0">
              {classData.grade}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => onStartClassConversation(classData.id)}
              className="flex-1 text-xs sm:text-sm"
            >
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Discussion
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={loadStudents}
              className="flex-1 bg-transparent text-xs sm:text-sm"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Voir étudiants</span>
              <span className="sm:hidden">Étudiants</span>
            </Button>
          </div>

          {studentsLoaded && students.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs sm:text-sm font-medium mb-2">Étudiants de la classe:</p>
              <div className="space-y-1 max-h-24 sm:max-h-32 overflow-y-auto">
                {students.map((student) => (
                  <div key={student.uid} className="text-xs text-muted-foreground truncate">
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
      <div className="p-3 sm:p-4">
        <div className="animate-pulse space-y-3 sm:space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Mes Classes</h2>
        </div>
        {(currentUser.role === "admin") && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Créer une classe</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Créer une nouvelle classe</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="className" className="text-sm">
                    Nom de la classe
                  </Label>
                  <Input
                    id="className"
                    placeholder="ex: L1 Informatique..."
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="classGrade" className="text-sm">
                    Niveau
                  </Label>
                  <Select value={newClassGrade} onValueChange={setNewClassGrade}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Sélectionnez le niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L1">Licence 1</SelectItem>
                      <SelectItem value="L2">Licence 2</SelectItem>
                      <SelectItem value="L3">Licence 3</SelectItem>
                      <SelectItem value="M1">Master 1</SelectItem>
                      <SelectItem value="M2">Master 2</SelectItem>
                      <SelectItem value="D1">Doctorat 1</SelectItem>
                      <SelectItem value="D2">Doctorat 2</SelectItem>
                      <SelectItem value="D3">Doctorat 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button
                    onClick={handleCreateClass}
                    disabled={creating || !newClassName.trim() || !newClassGrade}
                    className="flex-1 text-sm"
                    size="sm"
                  >
                    {creating ? "Création..." : "Créer"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    className="flex-1 text-sm"
                    size="sm"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Classes List */}
      <ScrollArea className="h-[400px] sm:h-[500px]">
        <div className="grid gap-3 sm:gap-4">
          {classes.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm sm:text-base">
                {currentUser.role === "student" ? "Vous n'êtes inscrit dans aucune classe pour le moment." : "Aucune classe à afficher."}
              </p>
            </div>
          ) : (
            classes.map((classData) => <ClassCard key={classData.id} classData={classData} />)
          )}
        </div>
      </ScrollArea>
    </div>
  )
}