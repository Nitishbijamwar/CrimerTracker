import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function LawyerCommentForm({
  reportId,
  existingNote = "",
  onCommentAdded,
}) {
  const [note, setNote] = useState(existingNote);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, { notes: note });
      alert("✅ Comment added successfully");
      if (onCommentAdded) onCommentAdded(note);
    } catch (error) {
      console.error("Error updating note:", error);
      alert("❌ Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 bg-gradient-to-br from-white to-gray-100 p-6 rounded-2xl shadow-lg transition-all duration-300"
    >
      <h3 className="text-xl font-semibold mb-3 text-indigo-700 flex items-center gap-2">
        🖋️ Lawyer's Comment
      </h3>

      <textarea
        className="w-full border border-gray-300 p-3 rounded-lg resize-none focus:ring-2 focus:ring-indigo-300 shadow-sm transition"
        rows="4"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Type your comment here..."
        required
      ></textarea>

      <button
        type="submit"
        disabled={loading}
        className={`mt-4 px-5 py-2 rounded text-white font-medium transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {loading ? "Saving..." : "Submit Comment"}
      </button>
    </form>
  );
}
