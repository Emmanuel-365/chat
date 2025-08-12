import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { SchoolUser } from "@/types/user";
import { getInvitation, acceptInvitation } from "./invitations";

import logger from "./logger";
import { AuthError } from "./errors";

export const createAccount = async (
  email: string,
  password: string,
  displayName: string,
  invitationId: string
) => {
  try {
    const invitation = await getInvitation(invitationId);

    if (!invitation || invitation.status !== "pending") {
      throw new AuthError("Invalid or used invitation code.");
    }

    if (invitation.email !== email) {
      throw new AuthError("Email does not match invitation.");
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create user document in Firestore
    const userData: SchoolUser = {
      uid: user.uid,
      email: user.email!,
      displayName,
      role: invitation.role,
      isActive: true,
      createdAt: new Date(),
      ...(invitation.role === "student" && { studentProfile: invitation.studentProfile }),
    };

    await setDoc(doc(db, "users", user.uid), userData);
    await acceptInvitation(invitationId);
    await sendEmailVerification(user);

    return { user: userData, error: null };
  } catch (error: unknown) {
    logger.error({ err: error }, "Error creating account");
    let errorMessage = "An unexpected error occurred during registration.";
    if (error instanceof Error) {
      errorMessage = error.message;
      if (typeof error === 'object' && error !== null && 'code' in error) {
        switch ((error as { code: string }).code) { // Type assertion for 'code'
          case "auth/email-already-in-use":
            errorMessage = "This email is already in use.";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email address.";
            break;
          case "auth/operation-not-allowed":
            errorMessage = "Email/password accounts are not enabled.";
            break;
          case "auth/weak-password":
            errorMessage = "Password is too weak.";
            break;
          default:
            // errorMessage already set to default
            break;
        }
      }
    }
    throw new AuthError(errorMessage);
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      throw new AuthError("Please verify your email before logging in.");
    }

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data() as SchoolUser;

      // Update last seen
      await updateDoc(doc(db, "users", user.uid), {
        lastSeen: new Date(),
      });

      return { user: userData, error: null };
    } else {
      throw new AuthError("User data not found.");
    }
  } catch (error: unknown) {
    logger.error({ err: error }, "Error signing in");
    let errorMessage = "An unexpected error occurred during login.";
    if (error instanceof Error) {
      errorMessage = error.message;
      if (typeof error === 'object' && error !== null && 'code' in error) {
        switch ((error as { code: string }).code) { // Type assertion for 'code'
          case "auth/invalid-email":
            errorMessage = "Invalid email or password.";
            break;
          case "auth/user-disabled":
            errorMessage = "Your account has been disabled.";
            break;
          case "auth/user-not-found":
            errorMessage = "Invalid email or password.";
            break;
          case "auth/wrong-password":
            errorMessage = "Invalid email or password.";
            break;
          default:
            // errorMessage already set to default
            break;
        }
      }
    }
    throw new AuthError(errorMessage);
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred during sign out.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { error: errorMessage };
  }
}

export const getCurrentUser = async (): Promise<SchoolUser | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      unsubscribe()
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          resolve(userDoc.data() as SchoolUser)
        } else {
          resolve(null)
        }
      } else {
        resolve(null)
      }
    })
  })
}
