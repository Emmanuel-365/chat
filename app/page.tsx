"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Users, BookOpen, Shield } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to dashboard
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">EcoleChat</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Plateforme de messagerie sécurisée pour votre établissement scolaire
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/login")} size="lg">
              Se connecter
            </Button>
            <Button onClick={() => router.push("/register")} variant="outline" size="lg">
              S'inscrire
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <MessageCircle className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Messagerie Instantanée</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Communiquez en temps réel avec vos collègues et étudiants</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Gestion des Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Organisez vos conversations par classe et matière</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Annonces</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Diffusez des informations importantes à toute l'école</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>Sécurisé</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Environnement sûr avec contrôle d'accès par rôles</CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
