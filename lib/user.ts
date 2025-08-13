import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export const updateUserProfilePicture = async (userId: string, newProfilePictureUrl: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      profilePicture: newProfilePictureUrl,
    });
    return { success: true };
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error updating profile picture:", errorMessage);
    return { success: false, error: errorMessage };
  }
};
