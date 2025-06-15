import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function ReportsPanel() {
  const [allReports, setAllReports] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLawyers, setSelectedLawyers] = useState({});
  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      await fetchReports();
      await fetchLawyers();
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchReports = async () => {
    const crimeSnap = await getDocs(collection(db, "reports"));
    const witnessSnap = await getDocs(collection(db, "witness_reports"));

    const crimeReports = crimeSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      source: "crime",
    }));

    const witnessReports = witnessSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      source: "witness",
    }));

    setAllReports([...crimeReports, ...witnessReports]);
  };

  const fetchLawyers = async () => {
    const q = query(collection(db, "users"), where("role", "==", "lawyer"));
    const snapshot = await getDocs(q);
    const lawyerData = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));
    setLawyers(lawyerData);
  };

  const assignLawyer = async (reportId) => {
    const selected = selectedLawyers[reportId];
    if (!selected) {
      alert("Please select a lawyer.");
      return;
    }

    try {
      await updateDoc(doc(db, "reports", reportId), {
        assignedLawyerId: selected.uid,
        assignedLawyerEmail: selected.email,
      });

      // ✅ Send notification to the lawyer
      await addDoc(collection(db, "notifications"), {
        recipientId: selected.uid,
        message: "You have been assigned a new case.",
        read: false,
        timestamp: serverTimestamp(),
      });

      alert(`Lawyer (${selected.email}) assigned successfully!`);
      await fetchReports();
    } catch (error) {
      console.error("Error assigning lawyer:", error);
      alert("Failed to assign lawyer.");
    }
  };

  const handleEdit = async (report) => {
    if (report.source === "witness") {
      const updatedTestimony = prompt("Edit Testimony:", report.testimony);
      if (updatedTestimony) {
        try {
          await updateDoc(doc(db, "witness_reports", report.id), {
            testimony: updatedTestimony,
          });
          alert("Testimony updated successfully");
          fetchReports();
        } catch (error) {
          console.error("Error updating testimony:", error);
          alert("Failed to update");
        }
      }
    } else {
      const updatedType = prompt("Edit Crime Type:", report.type);
      const updatedDescription = prompt(
        "Edit Description:",
        report.description
      );
      const updatedLocation = prompt("Edit Location:", report.location);

      if (updatedType && updatedDescription && updatedLocation) {
        try {
          await updateDoc(doc(db, "reports", report.id), {
            type: updatedType,
            description: updatedDescription,
            location: updatedLocation,
          });
          alert("Report updated successfully");
          fetchReports();
        } catch (error) {
          console.error("Error updating report:", error);
          alert("Failed to update report");
        }
      }
    }
  };

  const handleDelete = async (report) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this report?"
    );
    if (!confirmDelete) return;

    try {
      const collectionName =
        report.source === "witness" ? "witness_reports" : "reports";
      await deleteDoc(doc(db, collectionName, report.id));
      alert("Report deleted successfully");
      fetchReports();
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Failed to delete report");
    }
  };

  const renderEvidence = (url) => {
    if (!url) return null;
    return (
      <div className="mb-3">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            📁 View Evidence
          </button>
        </a>
      </div>
    );
  };

  const filteredReports = allReports.filter((r) => {
    const matchType = filterType ? r.type === filterType : true;
    const matchDate = filterDate
      ? r.date === filterDate || r.timestamp?.startsWith(filterDate)
      : true;
    return matchType && matchDate;
  });

  return (
    <div className="p-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center items-center">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">All Types</option>
          <option value="Theft">Theft</option>
          <option value="Assault">Assault</option>
          <option value="Fraud">Fraud</option>
        </select>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />

        <button
          onClick={() => {
            setFilterType("");
            setFilterDate("");
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
        >
          🔄 Revert Filters
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading data...</p>
      ) : filteredReports.length === 0 ? (
        <p className="text-center text-gray-600">No reports found.</p>
      ) : (
        filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white shadow-md border border-gray-200 rounded-xl p-5 mb-6"
          >
            <h2 className="text-xl font-semibold text-purple-700 mb-2">
              {report.source === "witness"
                ? "🧾 Witness Testimony"
                : `🚨 ${report.type}`}
            </h2>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Date:</strong>{" "}
              {report.date ||
                (report.timestamp &&
                  new Date(report.timestamp).toLocaleDateString())}{" "}
              | <strong>Location:</strong> {report.location || "N/A"}
            </p>
            <p className="text-gray-700 mb-2">
              {report.description || report.testimony}
            </p>

            {/* Evidence Button */}
            {renderEvidence(report.fileUrl || report.evidenceUrl)}

            {/* Assign Lawyer */}
            {report.source === "crime" && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Lawyer
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <select
                    className="w-full sm:w-2/3 border border-gray-300 rounded p-2 focus:outline-none"
                    defaultValue={report.assignedLawyerId || ""}
                    onChange={(e) => {
                      const selected = lawyers.find(
                        (l) => l.uid === e.target.value
                      );
                      setSelectedLawyers((prev) => ({
                        ...prev,
                        [report.id]: selected,
                      }));
                    }}
                  >
                    <option value="">Select a lawyer</option>
                    {lawyers.map((lawyer) => (
                      <option key={lawyer.uid} value={lawyer.uid}>
                        {lawyer.email}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => assignLawyer(report.id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                  >
                    Assign
                  </button>
                </div>
                {report.assignedLawyerEmail && (
                  <p className="text-green-600 text-sm mt-1">
                    Assigned to: {report.assignedLawyerEmail}
                  </p>
                )}
              </div>
            )}

            {/* Edit & Delete Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleEdit(report)}
                className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(report)}
                className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
