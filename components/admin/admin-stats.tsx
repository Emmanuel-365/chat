"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, BookOpen, MessageCircle, Activity, Shield } from "lucide-react"
import { getAdminStats, type AdminStats as StatsType } from "@/lib/admin"

export function AdminStats() {
  const [stats, setStats] = useState<StatsType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      const adminStats = await getAdminStats()
      setStats(adminStats)
      setLoading(false)
    }

    loadStats()

    // Actualiser les stats toutes les 30 secondes
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      title: "Utilisateurs Total",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Étudiants",
      value: stats.totalStudents,
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Professeurs",
      value: stats.totalTeachers,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Administrateurs",
      value: stats.totalAdmins,
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Classes",
      value: stats.totalClasses,
      icon: BookOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Messages",
      value: stats.totalMessages,
      icon: MessageCircle,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tableau de Bord Administrateur</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre plateforme EcoleChat</p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">{stats.activeUsers} utilisateurs actifs</span>
          <Badge variant="secondary">En temps réel</Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Activité Récente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Utilisateurs actifs (5 min)</span>
                <Badge variant="secondary">{stats.activeUsers}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Taux d'activité</span>
                <Badge variant="secondary">
                  {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Messages par utilisateur</span>
                <Badge variant="secondary">
                  {stats.totalUsers > 0 ? Math.round(stats.totalMessages / stats.totalUsers) : 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Répartition par Rôle</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Étudiants</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${stats.totalUsers > 0 ? (stats.totalStudents / stats.totalUsers) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats.totalStudents}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Professeurs</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${stats.totalUsers > 0 ? (stats.totalTeachers / stats.totalUsers) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats.totalTeachers}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Administrateurs</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{
                        width: `${stats.totalUsers > 0 ? (stats.totalAdmins / stats.totalUsers) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats.totalAdmins}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
