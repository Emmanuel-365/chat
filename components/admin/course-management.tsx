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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, BookCopy, Trash2, User, Users, Check } from "lucide-react"
import { getCourses, createCourse, deleteCourse } from "@/lib/courses"
import { getClasses } from "@/lib/classes"
import { getUsersByRole } from "@/lib/contacts"
import type { Course, Class, SchoolUser } from "@/types/user"

export function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<SchoolUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Form states
  const [newCourseName, setNewCourseName] = useState("")
  const [selectedTeacherId, setSelectedTeacherId] = useState("")
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([])
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const [coursesData, classesData, teachersData] = await Promise.all([
        getCourses(),
        getClasses(),
        getUsersByRole("teacher"),
      ]);

      setCourses(coursesData);
      setClasses(classesData);
      setTeachers(teachersData);
      setLoading(false);
    }

    loadData()
  }, [])

  const handleCreateCourse = async () => {
    if (!newCourseName.trim() || !selectedTeacherId || selectedClassIds.length === 0) return

    setCreating(true)
    const { success } = await createCourse(
      newCourseName.trim(),
      selectedTeacherId,
      selectedClassIds
    )

    if (success) {
      setNewCourseName("")
      setSelectedTeacherId("")
      setSelectedClassIds([])
      setShowCreateDialog(false)

      // Reload courses
      const updatedCourses = await getCourses()
      setCourses(updatedCourses)
    }

    setCreating(false)
  }

  const handleDeleteCourse = async (courseId: string) => {
    const success = await deleteCourse(courseId);
    if (success) {
      const updatedCourses = courses.filter((c) => c.id !== courseId);
      setCourses(updatedCourses);
    }
  }
  
  const handleClassSelection = (classId: string) => {
    setSelectedClassIds(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    )
  }

  const CourseCard = ({ course }: { course: Course }) => {
    const teacher = teachers.find(t => t.uid === course.teacherId)
    const courseClasses = classes.filter(c => course.classIds.includes(c.id))

    return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookCopy className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">{course.name}</CardTitle>
          </div>
          <Button size="sm" variant="destructive" onClick={() => handleDeleteCourse(course.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center"><User className="h-4 w-4 mr-2"/>Professeur:</span>
          <span className="font-medium">{teacher?.displayName || 'N/A'}</span>
        </div>

        <div className="text-sm">
            <span className="text-muted-foreground flex items-center"><Users className="h-4 w-4 mr-2"/>Classes:</span>
            <div className="flex flex-wrap gap-1 mt-2">
                {courseClasses.length > 0 ? courseClasses.map(c => (
                    <Badge key={c.id} variant="secondary">{c.name}</Badge>
                )) : <p className="text-xs text-muted-foreground">Aucune classe assignée</p>}
            </div>
        </div>
      </CardContent>
    </Card>
  )}

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardHeader><div className="h-6 bg-gray-200 rounded w-1/2"></div></CardHeader><CardContent><div className="space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="h-4 bg-gray-200 rounded w-1/2"></div></div></CardContent></Card>
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
          <h1 className="text-2xl font-bold">Gestion des Cours</h1>
          <p className="text-muted-foreground">Créez et gérez les cours de votre établissement</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer un cours
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau cours</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="courseName">Nom du cours</Label>
                <Input id="courseName" placeholder="ex: Algorithmique Avancée" value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} />
              </div>
              
              <div>
                <Label htmlFor="teacher">Professeur</Label>
                <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                  <SelectTrigger><SelectValue placeholder="Sélectionnez un professeur" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.uid} value={teacher.uid}>{teacher.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Classes</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-normal">
                            {selectedClassIds.length > 0 ? `${selectedClassIds.length} classe(s) sélectionnée(s)` : "Sélectionnez les classes"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <ScrollArea className="h-48">
                            <div className="p-2 space-y-1">
                            {classes.map((c) => (
                                <div key={c.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer" onClick={() => handleClassSelection(c.id)}>
                                    <Label htmlFor={`class-${c.id}`} className="font-normal flex-1 cursor-pointer">{c.name} ({c.grade})</Label>
                                    <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${selectedClassIds.includes(c.id) ? 'bg-primary' : ''}`}>
                                        {selectedClassIds.includes(c.id) && <Check className="h-3 w-3 text-primary-foreground" />}
                                    </div>
                                </div>
                            ))}
                            </div>
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateCourse} disabled={creating || !newCourseName.trim() || !selectedTeacherId || selectedClassIds.length === 0} className="flex-1">
                  {creating ? "Création..." : "Créer"}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">Annuler</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Courses List */}
      <ScrollArea className="h-[600px]">
        <div className="grid gap-4">
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookCopy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun cours créé</p>
            </div>
          ) : (
            courses.map((course) => <CourseCard key={course.id} course={course} />)
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
