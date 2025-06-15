import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    type: "",
    date: "",
    time: "",
    location: "",
    description: "",
  });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchReports(user);
        await fetchNotifications(user);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchReports = async (user) => {
    setLoading(true);
    try {
      const isAdmin = user.email === "admin@example.com";
      const reportQuery = isAdmin
        ? collection(db, "reports")
        : query(collection(db, "reports"), where("uid", "==", user.uid));
      const snapshot = await getDocs(reportQuery);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReports(data);
      setFilteredReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async (user) => {
    try {
      const q = query(
        collection(db, "notifications"),
        where("recipientId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this report?"
    );
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, "reports", id));
      const updated = reports.filter((r) => r.id !== id);
      setReports(updated);
      setFilteredReports(updated);
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const docRef = doc(db, "reports", id);
      await updateDoc(docRef, editData);
      alert("Report updated successfully");
      setEditId(null);
      const user = auth.currentUser;
      if (user) fetchReports(user);
    } catch (err) {
      console.error(err);
      alert("Error updating report");
    }
  };

  const handleFilter = () => {
    let filtered = [...reports];
    if (typeFilter) {
      filtered = filtered.filter(
        (r) => r.type.toLowerCase() === typeFilter.toLowerCase()
      );
    }
    if (dateFilter) {
      filtered = filtered.filter((r) => r.date === dateFilter);
    }
    if (search.trim()) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.description.toLowerCase().includes(lower) ||
          r.location.toLowerCase().includes(lower)
      );
    }
    setFilteredReports(filtered);
  };

  const handleReset = () => {
    setTypeFilter("");
    setDateFilter("");
    setSearch("");
    setFilteredReports(reports);
  };

  useEffect(() => {
    handleFilter();
  }, [typeFilter, dateFilter, search]);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-fadeIn">
      <h2 className="text-4xl font-bold text-center text-indigo-700 mb-12">
        🚓 Crime Reports Dashboard
      </h2>

      {/* 🔔 Notifications */}
      {notifications.length > 0 && (
        <div className="mb-10 bg-yellow-50 border border-yellow-300 rounded-xl p-4 shadow-md">
          <h3 className="text-xl font-semibold mb-2 text-yellow-700">
            🔔 Notifications
          </h3>
          <ul className="space-y-2">
            {notifications.map((note) => (
              <li key={note.id} className="text-sm text-gray-800">
                • {note.message}{" "}
                <span className="text-gray-500 text-xs">
                  ({note.timestamp?.toDate().toLocaleString()})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 justify-center mb-10 bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-2xl shadow-xl border">
        <select
          className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 shadow-md"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Filter by Type</option>
          <option value="Theft">Theft</option>
          <option value="Assault">Assault</option>
          <option value="Fraud">Fraud</option>
          <option value="Harassment">Harassment</option>
        </select>

        <input
          type="date"
          className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 shadow-md"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />

        <input
          type="text"
          className="border rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-indigo-500 shadow-md"
          placeholder="Search by description or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={handleReset}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200"
        >
          🔄 Reset
        </button>
      </div>

      {/* Reports List */}
      {loading ? (
        <p className="text-center text-gray-500">Loading reports...</p>
      ) : filteredReports.length === 0 ? (
        <p className="text-center text-gray-500">No reports found.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-gray-200 shadow-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-6 transition-transform transform hover:-translate-y-1 duration-300"
            >
              {editId === report.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editData.type}
                    onChange={(e) =>
                      setEditData({ ...editData, type: e.target.value })
                    }
                    className="w-full border px-4 py-2 rounded-lg shadow-inner"
                  />
                  <input
                    type="date"
                    value={editData.date}
                    onChange={(e) =>
                      setEditData({ ...editData, date: e.target.value })
                    }
                    className="w-full border px-4 py-2 rounded-lg shadow-inner"
                  />
                  <input
                    type="time"
                    value={editData.time}
                    onChange={(e) =>
                      setEditData({ ...editData, time: e.target.value })
                    }
                    className="w-full border px-4 py-2 rounded-lg shadow-inner"
                  />
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) =>
                      setEditData({ ...editData, location: e.target.value })
                    }
                    className="w-full border px-4 py-2 rounded-lg shadow-inner"
                  />
                  <textarea
                    value={editData.description}
                    onChange={(e) =>
                      setEditData({ ...editData, description: e.target.value })
                    }
                    className="w-full border px-4 py-2 rounded-lg shadow-inner"
                  />
                  <div className="flex gap-3">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl shadow-md transition"
                      onClick={() => handleUpdate(report.id)}
                    >
                      💾 Save
                    </button>
                    <button
                      className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-xl shadow-md transition"
                      onClick={() => setEditId(null)}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Type:</strong> {report.type}
                  </p>
                  <p>
                    <strong>Date:</strong> {report.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {report.time}
                  </p>
                  <p>
                    <strong>Location:</strong> {report.location}
                  </p>
                  <p>
                    <strong>Description:</strong> {report.description}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md transition"
                      onClick={() => {
                        setEditId(report.id);
                        setEditData({
                          type: report.type,
                          date: report.date,
                          time: report.time,
                          location: report.location,
                          description: report.description,
                        });
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition"
                      onClick={() => handleDelete(report.id)}
                    >
                      🗑️ Delete
                    </button>
                    <Link
                      to={`/case/${report.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition"
                    >
                      🔍 View Details
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
