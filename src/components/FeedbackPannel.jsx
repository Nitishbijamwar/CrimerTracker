import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";
import { format } from "date-fns";

export default function FeedbackPanel() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const q = query(
          collection(db, "feedback"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFeedbacks(list);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (loading) return <p className="text-center">Loading feedback...</p>;
  if (feedbacks.length === 0)
    return <p className="text-center">No feedback yet.</p>;

  return (
    <div className="space-y-4">
      {feedbacks.map(({ id, name, email, message, createdAt }) => (
        <div
          key={id}
          className="border rounded p-4 bg-white shadow hover:shadow-md transition"
        >
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-semibold text-blue-700">
              {name || "Anonymous"}
            </h3>
            <span className="text-sm text-gray-500">
              {createdAt?.seconds
                ? format(new Date(createdAt.seconds * 1000), "PPP p")
                : "Unknown date"}
            </span>
          </div>
          {email && <p className="text-sm text-gray-500 mb-1">📧 {email}</p>}
          <p className="text-gray-800 whitespace-pre-wrap">{message}</p>
        </div>
      ))}
    </div>
  );
}
