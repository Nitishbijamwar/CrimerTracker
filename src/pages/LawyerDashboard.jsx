import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import LawyerCommentForm from "../components/LawyerCommentForm";

export default function LawyerDashboard() {
  const [assignedCases, setAssignedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedCases = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
          collection(db, "reports"),
          where("assignedLawyerId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const cases = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAssignedCases(cases);
      } catch (error) {
        console.error("Error fetching assigned cases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedCases();
  }, []);

  const handleStatusUpdate = async (caseId) => {
    const newStatus = statusUpdates[caseId];
    if (!newStatus) return;

    try {
      await updateDoc(doc(db, "reports", caseId), {
        status: newStatus,
      });

      const updatedCase = assignedCases.find((item) => item.id === caseId);
      const userId = updatedCase?.userId;

      if (userId) {
        await addDoc(collection(db, "notifications"), {
          recipientId: userId,
          message: `Your case (${updatedCase.type}) has been updated to "${newStatus}" by your assigned lawyer.`,
          caseId: caseId,
          read: false,
          timestamp: Timestamp.now(),
        });
      }

      alert("Status updated and notification sent!");

      setAssignedCases((prev) =>
        prev.map((item) =>
          item.id === caseId ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-purple-700 text-center mb-10">
        Lawyer Dashboard
      </h1>

      {loading ? (
        <p className="text-center text-lg text-gray-500">
          Loading assigned cases...
        </p>
      ) : assignedCases.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          No cases assigned yet.
        </p>
      ) : (
        assignedCases.map((report) => (
          <div
            key={report.id}
            className="bg-white shadow-lg border border-gray-200 rounded-2xl p-6 mb-10 transition-all"
          >
            {/* 🧾 Case Header */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-indigo-700 mb-1">
                {report.type}
              </h2>
              <p className="text-sm text-gray-500">
                <strong>Date:</strong> {report.date} &nbsp; | &nbsp;
                <strong>Location:</strong> {report.location}
              </p>
            </div>

            {/* 📝 Description */}
            <p className="text-gray-700 mt-3 mb-3">{report.description}</p>

            {/* 🔖 Status */}
            <div className="mb-4">
              <p className="text-md font-medium">
                <strong>Status:</strong>{" "}
                <span className="text-green-600">
                  {report.status || "Not updated"}
                </span>
              </p>
            </div>

            {/* 📁 Evidence */}
            {report.fileUrl && (
              <a
                href={report.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mb-4"
              >
                <button className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 transition">
                  View Evidence
                </button>
              </a>
            )}

            {/* 🔄 Status Update */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <select
                className="w-full sm:w-2/3 border border-gray-300 rounded-md p-2 shadow-sm"
                value={statusUpdates[report.id] || ""}
                onChange={(e) =>
                  setStatusUpdates((prev) => ({
                    ...prev,
                    [report.id]: e.target.value,
                  }))
                }
              >
                <option value="">-- Update Status --</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <button
                onClick={() => handleStatusUpdate(report.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Update Status
              </button>
            </div>

            {/* 🗒️ Lawyer Comment */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-purple-700 mb-2 flex items-center gap-2">
                <span>🖊️ Lawyer's Comment</span>
              </h3>

              <LawyerCommentForm
                reportId={report.id}
                existingNote={report.notes || ""}
                onCommentAdded={(newNote) => {
                  setAssignedCases((prev) =>
                    prev.map((item) =>
                      item.id === report.id ? { ...item, notes: newNote } : item
                    )
                  );
                }}
              />
            </div>

            {/* 🔍 View Full Case */}
            <div className="text-right">
              <button
                onClick={() => navigate(`/case/${report.id}`)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
              >
                View Full Case Details
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
