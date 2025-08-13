"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth";
import { createInvitation } from "@/lib/invitations";
import { RoleBadge } from "@/components/auth/role-badge";
import type { UserRole, StudentProfile } from "@/types/user";

export function UserCreation() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    displayName: "",
    role: "" as UserRole,
    className: "",
    department: "",
    position: "",
    subject: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.displayName || !formData.role) {
      setMessage({ type: "error", text: "Veuillez remplir tous les champs obligatoires" });
      return;
    }

    if (!user) {
      setMessage({ type: "error", text: "Vous devez être connecté pour envoyer une invitation" });
      return;
    }

    setLoading(true);
    setMessage(null);

    const studentProfile: StudentProfile = {};
    if (formData.className) studentProfile.className = formData.className;

    const result = await createInvitation(
      formData.email,
      formData.role,
      user.uid,
      formData.displayName,
      studentProfile
    );

    if (result.success) {
      setMessage({
        type: "success",
        text: `Invitation envoyée avec succès à ${formData.email}`,
      });
      // Réinitialiser le formulaire
      setFormData({
        email: "",
        displayName: "",
        role: "" as UserRole,
        className: "",
        department: "",
        position: "",
        subject: "",
      });
    } else {
      setMessage({ type: "error", text: "Erreur lors de l'envoi de l'invitation" });
    }

    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Inviter un nouvel utilisateur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="utilisateur@ecole.fr"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Nom complet *</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleInputChange("displayName", e.target.value)}
                placeholder="Jean Dupont"
                required
              />
            </div>
          </div>

          {/* Rôle */}
          <div className="space-y-2">
            <Label htmlFor="role">Rôle *</Label>
            <Select value={formData.role} onValueChange={(value: UserRole) => handleInputChange("role", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Étudiant</SelectItem>
                <SelectItem value="teacher">Professeur</SelectItem>
                <SelectItem value="staff">Personnel</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
            {formData.role && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">Aperçu:</span>
                <RoleBadge role={formData.role} />
              </div>
            )}
          </div>

          {/* Champs conditionnels selon le rôle */}
          {formData.role === "student" && (
            <div className="space-y-2">
              <Label htmlFor="className">Classe</Label>
              <Input
                id="className"
                value={formData.className}
                onChange={(e) => handleInputChange("className", e.target.value)}
                placeholder="6ème A, Terminale S, L1 Informatique..."
              />
            </div>
          )}

          {formData.role === "teacher" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Matière</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder="Mathématiques, Français, Histoire..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Département</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  placeholder="Sciences, Lettres, Langues..."
                />
              </div>
            </div>
          )}

          {formData.role === "staff" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Poste</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                  placeholder="Secrétaire, Comptable, Technicien..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Département</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  placeholder="Administration, Maintenance, RH..."
                />
              </div>
            </div>
          )}

          {/* Message de statut */}
          {message && (
            <Alert className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Informations sur le processus */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Processus d&apos;invitation:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Un nom d&apos;utilisateur sera généré automatiquement</li>
                  <li>• Un email d&apos;invitation sera envoyé à l&apos;utilisateur</li>
                  <li>• L&apos;utilisateur pourra définir son mot de passe via le lien</li>
                  <li>• Le lien d&apos;invitation expire dans 7 jours</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bouton de soumission */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Envoyer l&apos;invitation
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
