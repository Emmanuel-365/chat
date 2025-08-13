"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, CheckCircle, AlertCircle, UserCheck } from "lucide-react";
import { getInvitation } from "@/lib/invitations";
import { createAccountFromInvitation } from "@/lib/auth";
import type { Invitation as PendingInvitation } from "@/types/user";
import { RoleBadge } from "@/components/auth/role-badge";
import zxcvbn from "zxcvbn";

export default function InvitationPage() {
  const params = useParams()
  const router = useRouter()
  const invitationId = params.id as string

  const [invitation, setInvitation] = useState<PendingInvitation | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const loadInvitation = async () => {
      if (!invitationId) return;

      try {
        const invitationData = await getInvitation(invitationId);

        if (!invitationData) {
          setError("Invitation non trouvée ou expirée");
        } else if (invitationData.status !== "pending") {
          setError("Cette invitation a déjà été utilisée");
        } else if (invitationData.expiresAt && new Date() > new Date(invitationData.expiresAt)) {
          setError("Cette invitation a expiré");
        } else {
          setInvitation(invitationData);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      }

      setLoading(false);
    };

    loadInvitation();
  }, [invitationId]);

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    const strength = zxcvbn(pwd).score;
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invitation) return;

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordStrength < 2) {
      setError("Le mot de passe est trop faible.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createAccountFromInvitation(invitationId, password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Invitation invalide</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/login")} variant="outline">
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Compte créé avec succès !</h1>
            <p className="text-gray-600 mb-4">
              Votre compte a été créé. Vous allez être redirigé vers la page de connexion...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <UserCheck className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Finaliser votre inscription</CardTitle>
          <p className="text-muted-foreground">Définissez votre mot de passe pour activer votre compte</p>
        </CardHeader>
        <CardContent>
          {invitation && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Nom:</span>
                <span className="text-sm">{invitation.displayName}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{invitation.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rôle:</span>
                <RoleBadge role={invitation.role} />
              </div>
              {invitation.role === "student" && invitation.studentProfile && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Classe:</span>
                    <span className="text-sm">
                      {invitation.studentProfile.className || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Niveau:</span>
                    <span className="text-sm">
                      {invitation.studentProfile.grade || "N/A"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className={`h-2.5 rounded-full ${["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-green-500"][passwordStrength]}`}
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre mot de passe"
                required
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Le mot de passe doit contenir :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Au moins 8 caractères</li>
                <li>Une lettre minuscule</li>
                <li>Une lettre majuscule</li>
                <li>Un chiffre</li>
              </ul>
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création du compte...
                </>
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

