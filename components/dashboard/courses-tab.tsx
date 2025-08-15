"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, BookCopy, User } from "lucide-react"
import { getCoursesByTeacher, getCoursesByClass } from "@/lib/courses"
import { getUserById } from "@/lib/contacts"
import type { Course, SchoolUser } from "@/types/user"

interface CoursesTabProps {
  currentUser: SchoolUser
  onStartCourseConversation: (courseId: string) => void
}

interface CourseWithTeacher extends Course {
  teacher: SchoolUser | null;
}

export function CoursesTab({ currentUser, onStartCourseConversation }: CoursesTabProps) {
  const [courses, setCourses] = useState<CourseWithTeacher[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true)
      let coursesData: Course[] = [];

      if (currentUser.role === "teacher") {
        coursesData = await getCoursesByTeacher(currentUser.uid);
      } else if (currentUser.role === "student" && currentUser.studentProfile?.classId) {
        coursesData = await getCoursesByClass(currentUser.studentProfile.classId);
      }

      const coursesWithTeachers = await Promise.all(
        coursesData.map(async (course) => {
          const teacher = await getUserById(course.teacherId);
          return { ...course, teacher };
        })
      );

      setCourses(coursesWithTeachers);
      setLoading(false);
    }

    loadCourses()
  }, [currentUser])

  const CourseCard = ({ course }: { course: CourseWithTeacher }) => {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <BookCopy className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">{course.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center"><User className="h-4 w-4 mr-2"/>Professeur:</span>
            <span className="font-medium">{course.teacher?.displayName || 'N/A'}</span>
          </div>
          <Button
            size="sm"
            onClick={() => onStartCourseConversation(course.id)}
            className="w-full mt-2"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Discussion du cours
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardHeader><div className="h-6 bg-gray-200 rounded w-2/3"></div></CardHeader><CardContent><div className="h-4 bg-gray-200 rounded w-1/2"></div><div className="h-9 mt-2 bg-gray-200 rounded"></div></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Mes Cours</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid gap-4">
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookCopy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Vous n&apos;êtes inscrit à aucun cours.</p>
            </div>
          ) : (
            courses.map((course) => <CourseCard key={course.id} course={course} />)
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
