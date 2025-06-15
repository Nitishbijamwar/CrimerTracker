import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

/**
 * Sends a notification to a specific user.
 * @param {string} recipientId - Firebase Auth UID of the recipient.
 * @param {string} message - Notification message.
 * @param {string} type - Optional: "info", "case", etc.
 */
export async function sendNotification(recipientId, message, type = "info") {
  try {
    await addDoc(collection(db, "notifications"), {
      recipientId,
      message,
      read: false,
      type,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error("Error sending notification:", err);
  }
}
