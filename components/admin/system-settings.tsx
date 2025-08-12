"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Database, Shield, MessageCircle, Users } from "lucide-react"

export function SystemSettings() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Paramètres Système</h1>
        <p className="text-muted-foreground">Configuration et paramètres de votre plateforme EcoleChat</p>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Base de Données</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Statut Firebase</span>
              <Badge variant="secondary">Connecté</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Authentification</span>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Firestore</span>
              <Badge variant="secondary">Opérationnel</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Storage</span>
              <Badge variant="secondary">Disponible</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Sécurité</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Authentification requise</span>
              <Badge variant="secondary">Activée</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Contrôle des rôles</span>
              <Badge variant="secondary">Activé</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Modération</span>
              <Badge variant="secondary">Manuelle</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Chiffrement</span>
              <Badge variant="secondary">TLS/SSL</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Messagerie</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Messages temps réel</span>
              <Badge variant="secondary">Activés</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Conversations directes</span>
              <Badge variant="secondary">Autorisées</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Messages de classe</span>
              <Badge variant="secondary">Autorisés</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Historique</span>
              <Badge variant="secondary">Conservé</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Utilisateurs</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Inscription libre</span>
              <Badge variant="secondary">Activée</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Validation email</span>
              <Badge variant="secondary">Requise</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rôles multiples</span>
              <Badge variant="secondary">Supportés</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Profils publics</span>
              <Badge variant="secondary">Limités</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Informations Système</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">Version</h4>
              <p className="text-sm text-muted-foreground">EcoleChat v1.0.0</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Framework</h4>
              <p className="text-sm text-muted-foreground">Next.js 14 + Firebase</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Déploiement</h4>
              <p className="text-sm text-muted-foreground">Vercel Platform</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités à venir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Configuration des notifications push</p>
            <p>• Paramètres de modération automatique</p>
            <p>• Intégration avec systèmes scolaires externes</p>
            <p>• Rapports et analytics avancés</p>
            <p>• Sauvegarde et restauration automatiques</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
