import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "./firebase"
import type { UserRole } from "@/types/user"

export interface PendingInvitation {
  id?: string
  email: string
  role: UserRole
  displayName: string
  username: string
  className?: string
  department?: string
  position?: string
  subject?: string
  invitedBy: string
  invitedAt: any
  status: "pending" | "accepted" | "expired"
  expiresAt: any
}

// Générer un nom d'utilisateur unique
export const generateUsername = (displayName: string, role: UserRole): string => {
  const cleanName = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 10)

  const rolePrefix = {
    student: "etu",
    teacher: "prof",
    admin: "admin",
    staff: "staff",
  }[role]

  const randomSuffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${rolePrefix}_${cleanName}_${randomSuffix}`
}

// Créer une invitation
export const createInvitation = async (
  email: string,
  role: UserRole,
  displayName: string,
  invitedBy: string,
  additionalData?: {
    className?: string
    department?: string
    position?: string
    subject?: string
  },
): Promise<{ success: boolean; invitationId?: string; error?: string }> => {
  try {
    // Vérifier si l'email existe déjà
    const usersQuery = query(collection(db, "users"), where("email", "==", email))
    const existingUsers = await getDocs(usersQuery)

    if (!existingUsers.empty) {
      return { success: false, error: "Un utilisateur avec cet email existe déjà" }
    }

    // Vérifier si une invitation est déjà en attente
    const invitationsQuery = query(
      collection(db, "invitations"),
      where("email", "==", email),
      where("status", "==", "pending"),
    )
    const existingInvitations = await getDocs(invitationsQuery)

    if (!existingInvitations.empty) {
      return { success: false, error: "Une invitation est déjà en attente pour cet email" }
    }

    // Générer un nom d'utilisateur unique
    const username = generateUsername(displayName, role)

    // Créer l'invitation
    const invitation: Omit<PendingInvitation, "id"> = {
      email,
      role,
      displayName,
      username,
      invitedBy,
      invitedAt: serverTimestamp(),
      status: "pending",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      ...additionalData,
    }

    const docRef = await addDoc(collection(db, "invitations"), invitation)

    // Envoyer l'email d'invitation (simulation)
    await sendInvitationEmail(email, displayName, docRef.id, username)

    return { success: true, invitationId: docRef.id }
  } catch (error) {
    console.error("Erreur lors de la création de l'invitation:", error)
    return { success: false, error: "Erreur lors de la création de l'invitation" }
  }
}

// Simuler l'envoi d'email (dans un vrai projet, utilisez un service comme SendGrid)
const sendInvitationEmail = async (email: string, displayName: string, invitationId: string, username: string) => {
  const invitationLink = `${window.location.origin}/invitation/${invitationId}`

  console.log(`
    📧 EMAIL D'INVITATION ENVOYÉ À: ${email}
    
    Bonjour ${displayName},
    
    Vous avez été invité(e) à rejoindre la plateforme de messagerie scolaire.
    
    Votre nom d'utilisateur: ${username}
    
    Cliquez sur le lien suivant pour définir votre mot de passe et activer votre compte:
    ${invitationLink}
    
    Ce lien expire dans 7 jours.
    
    Cordialement,
    L'équipe administrative
  `)

  // Dans un vrai projet, remplacez par un vrai service d'email
  alert(`Email d'invitation envoyé à ${email}\n\nLien d'invitation: ${invitationLink}\nNom d'utilisateur: ${username}`)
}

// Récupérer une invitation par ID
export const getInvitation = async (invitationId: string): Promise<PendingInvitation | null> => {
  try {
    const invitationsQuery = query(collection(db, "invitations"), where("__name__", "==", invitationId))
    const snapshot = await getDocs(invitationsQuery)

    if (snapshot.empty) return null

    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() } as PendingInvitation
  } catch (error) {
    console.error("Erreur lors de la récupération de l'invitation:", error)
    return null
  }
}

// Accepter une invitation et créer le compte
export const acceptInvitation = async (
  invitationId: string,
  password: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const invitation = await getInvitation(invitationId)

    if (!invitation) {
      return { success: false, error: "Invitation non trouvée" }
    }

    if (invitation.status !== "pending") {
      return { success: false, error: "Cette invitation a déjà été utilisée" }
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      return { success: false, error: "Cette invitation a expiré" }
    }

    // Créer le compte utilisateur
    const userCredential = await createUserWithEmailAndPassword(auth, invitation.email, password)

    // Créer le profil utilisateur dans Firestore
    const userData = {
      uid: userCredential.user.uid,
      email: invitation.email,
      displayName: invitation.displayName,
      username: invitation.username,
      role: invitation.role,
      className: invitation.className || null,
      department: invitation.department || null,
      position: invitation.position || null,
      subject: invitation.subject || null,
      profilePicture: null,
      isActive: true,
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
    }

    await addDoc(collection(db, "users"), userData)

    // Marquer l'invitation comme acceptée
    await updateDoc(doc(db, "invitations", invitationId), {
      status: "accepted",
    })

    return { success: true }
  } catch (error) {
    console.error("Erreur lors de l'acceptation de l'invitation:", error)
    return { success: false, error: "Erreur lors de la création du compte" }
  }
}

// Récupérer toutes les invitations en attente
export const getPendingInvitations = async (): Promise<PendingInvitation[]> => {
  try {
    const invitationsQuery = query(collection(db, "invitations"), where("status", "==", "pending"))
    const snapshot = await getDocs(invitationsQuery)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PendingInvitation[]
  } catch (error) {
    console.error("Erreur lors de la récupération des invitations:", error)
    return []
  }
}

// Annuler une invitation
export const cancelInvitation = async (invitationId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, "invitations", invitationId))
    return true
  } catch (error) {
    console.error("Erreur lors de l'annulation de l'invitation:", error)
    return false
  }
}
