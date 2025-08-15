import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import type { UserRole, StudentProfile, Invitation } from "@/types/user";

import logger from "./logger";
import { InvitationError } from "./errors";

export const createInvitation = async (email: string, role: UserRole, createdBy: string, displayName: string, studentProfile?: StudentProfile) => {
  try {
    const invitationData: Omit<Invitation, 'id'> = {
      email,
      role,
      status: "pending",
      createdAt: new Date(),
      createdBy,
      displayName,
      ...(studentProfile && { studentProfile }),
    };

    const docRef = await addDoc(collection(db, "invitations"), invitationData);

    // Call the Next.js API route to send the email
    try {
      const apiResponse = await fetch('/api/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: invitationData.email,
          displayName: invitationData.displayName,
          role: invitationData.role,
          invitationId: docRef.id,
        }),
      });

      const apiResult = await apiResponse.json();
      if (!apiResult.success) {
        logger.error({ apiResult }, 'Failed to trigger email sending via API route - Inner Catch');
        // Optionally, throw an error or handle it more gracefully
      }
    } catch (apiError: unknown) {
      if (apiError instanceof Error) {
        logger.error({ apiError }, 'Error calling send-invitation API route - Inner Catch');
      } else {
        logger.error({ apiError }, 'Error calling send-invitation API route - Inner Catch: An unknown error occurred');
      }
      // Optionally, throw an error or handle it more gracefully
    }

    return { success: true, invitationId: docRef.id };
  } catch (error: unknown) {
    logger.error({ error }, "Error creating invitation - Outer Catch");
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unknown error occurred.";
    }
    throw new InvitationError(errorMessage);
  }
};

export const getInvitation = async (invitationId: string): Promise<Invitation | null> => {
  try {
    const invitationsQuery = query(collection(db, "invitations"), where("__name__", "==", invitationId));
    const snapshot = await getDocs(invitationsQuery);

    if (snapshot.empty) return null;

    const invitationDoc = snapshot.docs[0];
    return { id: invitationDoc.id, ...invitationDoc.data() } as Invitation;
  } catch (error) {
    logger.error({ err: error }, "Error getting invitation");
    throw new InvitationError("Error getting invitation:");
  }
};

export const acceptInvitation = async (invitationId: string) => {
  try {
    await updateDoc(doc(db, "invitations", invitationId), {
      status: "accepted",
    });
    return { success: true };
  } catch (error: unknown) {
    logger.error({ err: error }, "Error accepting invitation");
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new InvitationError(errorMessage);
  }
};