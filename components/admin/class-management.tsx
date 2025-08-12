"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, BookOpen, Users, Trash2, UserPlus } from "lucide-react"
import { getClasses, createClass, deleteClass, addStudentToClass, removeStudentFromClass } from "@/lib/classes"
import { getUsersByRole, getUsersByClass } from "@/lib/contacts"
import type { Class, SchoolUser } from "@/types/user"

export function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<SchoolUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showStudentsDialog, setShowStudentsDialog] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [classStudents, setClassStudents] = useState<SchoolUser[]>([])
  const [availableStudents, setAvailableStudents] = useState<SchoolUser[]>([])

  // Form states
  const [newClassName, setNewClassName] = useState("")
  const [newClassGrade, setNewClassGrade] = useState("")
  const [selectedTeacherId, setSelectedTeacherId] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const [classesData, teachersData] = await Promise.all([
        getClasses(),
        getUsersByRole("teacher"),
      ]);

      setClasses(classesData);
      setTeachers(teachersData);
      setLoading(false);
    }

    loadData()
  }, [])

  const handleCreateClass = async () => {
    if (!newClassName.trim() || !newClassGrade.trim() || !selectedTeacherId) return

    setCreating(true)
    const { success } = await createClass(
      newClassName.trim(),
      newClassGrade,
      selectedTeacherId
    )

    if (success) {
      setNewClassName("")
      setNewClassGrade("")
      setSelectedTeacherId("")
      setShowCreateDialog(false)

      // Recharger les classes
      const updatedClasses = await getClasses()
      setClasses(updatedClasses)
    }

    setCreating(false)
  }

  const handleDeleteClass = async (classData: Class) => {
    const success = await deleteClass(classData.id);
    if (success) {
      const updatedClasses = classes.filter((c) => c.id !== classData.id);
      setClasses(updatedClasses);
    }
  }

  const handleViewStudents = async (classData: Class) => {
    setSelectedClass(classData)
    const [classStudentsData, allStudents] = await Promise.all([
      getUsersByClass(classData.id),
      getUsersByRole("student"),
    ])

    setClassStudents(classStudentsData)
    setAvailableStudents(allStudents.filter((s) => !s.studentProfile?.classId || s.studentProfile?.classId !== classData.id))
    setShowStudentsDialog(true)
  }

  const handleAddStudent = async (studentId: string) => {
    if (!selectedClass) return

    const success = await addStudentToClass(selectedClass.id, studentId)
    if (success) {
      // Recharger les données
      const [updatedClassStudents, updatedAvailableStudents] = await Promise.all([
        getUsersByClass(selectedClass.id),
        getUsersByRole("student"),
      ])

      setClassStudents(updatedClassStudents)
      setAvailableStudents(updatedAvailableStudents.filter((s) => !s.studentProfile?.classId || s.studentProfile?.classId !== selectedClass.id))
    }
  }

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedClass) return

    const success = await removeStudentFromClass(studentId)
    if (success) {
      // Recharger les données
      const [updatedClassStudents, updatedAvailableStudents] = await Promise.all([
        getUsersByClass(selectedClass.id),
        getUsersByRole("student"),
      ])

      setClassStudents(updatedClassStudents)
      setAvailableStudents(updatedAvailableStudents.filter((s) => !s.studentProfile?.classId || s.studentProfile?.classId !== selectedClass.id))
    }
  }

  const ClassCard = ({ classData }: { classData: Class }) => {
    const teacher = teachers.find(t => t.uid === classData.teacherId)
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
          <span className="font-medium">{teacher?.displayName}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Créée le:</span>
          <span>{classData.createdAt.toLocaleDateString()}</span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={() => handleViewStudents(classData)} className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            Gérer étudiants
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleDeleteClass(classData)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )}

  if (loading) {
    return (
      <div className="p-6">
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Classes</h1>
          <p className="text-muted-foreground">Créez et gérez les classes de votre établissement</p>
        </div>
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
              <div>
                <Label htmlFor="teacher">Professeur principal</Label>
                <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un professeur" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.uid} value={teacher.uid}>
                        {teacher.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateClass}
                  disabled={creating || !newClassName.trim() || !newClassGrade || !selectedTeacherId}
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
      </div>

      {/* Classes List */}
      <ScrollArea className="h-[600px]">
        <div className="grid gap-4">
          {classes.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune classe créée</p>
              <p className="text-sm text-muted-foreground mt-2">Créez votre première classe pour commencer</p>
            </div>
          ) : (
            classes.map((classData) => <ClassCard key={classData.id} classData={classData} />)
          )}
        </div>
      </ScrollArea>

      {/* Students Management Dialog */}
      <Dialog open={showStudentsDialog} onOpenChange={setShowStudentsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gestion des étudiants - {selectedClass?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6">
            {/* Current Students */}
            <div>
              <h3 className="font-medium mb-3">Étudiants de la classe ({classStudents.length})</h3>
              <ScrollArea className="h-80 border rounded-md p-3">
                <div className="space-y-2">
                  {classStudents.map((student) => (
                    <div key={student.uid} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{student.displayName}</span>
                      <Button size="sm" variant="destructive" onClick={() => handleRemoveStudent(student.uid)}>
                        Retirer
                      </Button>
                    </div>
                  ))}
                  {classStudents.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun étudiant dans cette classe</p>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Available Students */}
            <div>
              <h3 className="font-medium mb-3">Étudiants disponibles ({availableStudents.length})</h3>
              <ScrollArea className="h-80 border rounded-md p-3">
                <div className="space-y-2">
                  {availableStudents.map((student) => (
                    <div key={student.uid} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <span className="text-sm">{student.displayName}</span>
                        {student.studentProfile?.className && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {student.studentProfile.className}
                          </Badge>
                        )}
                      </div>
                      <Button size="sm" onClick={() => handleAddStudent(student.uid)}>
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {availableStudents.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun étudiant disponible</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}