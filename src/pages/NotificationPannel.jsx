import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("unread");

  useEffect(() => {
    let unsubscribeSnapshot;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(
          collection(db, "notifications"),
          where("recipientId", "==", user.uid),
          orderBy("timestamp", "desc")
        );

        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const fetched = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setNotifications(fetched);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  const renderNotifications = (list, isRead = false) => (
    <ul className="space-y-4 mt-4">
      {list.map((notif) => (
        <li
          key={notif.id}
          className={`p-4 rounded-lg shadow ${
            isRead ? "bg-gray-100" : "bg-yellow-100"
          }`}
        >
          <p className="text-gray-800 font-medium">
            {notif.message || "No message provided."}
            {notif.caseId && (
              <Link
                to={`/case/${notif.caseId}`}
                className="ml-3 text-blue-600 underline text-sm"
              >
                View Case
              </Link>
            )}
          </p>
          <p className="text-sm text-gray-500">
            {notif.timestamp?.toDate().toLocaleString()}
          </p>

          <div className="mt-2 flex gap-3">
            {!isRead && (
              <button
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => markAsRead(notif.id)}
              >
                Mark as Read
              </button>
            )}
            <button
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => deleteNotification(notif.id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold mb-6 text-indigo-700 flex items-center gap-2">
        🔔 Notifications
      </h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-full font-semibold transition ${
            activeTab === "unread"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setActiveTab("unread")}
        >
          Unread Notifications
        </button>
        <button
          className={`px-4 py-2 rounded-full font-semibold transition ${
            activeTab === "past"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setActiveTab("past")}
        >
          Past Notifications
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : activeTab === "unread" ? (
        unread.length === 0 ? (
          <p className="text-gray-500 italic">No unread notifications.</p>
        ) : (
          renderNotifications(unread)
        )
      ) : read.length === 0 ? (
        <p className="text-gray-500 italic">No past notifications.</p>
      ) : (
        renderNotifications(read, true)
      )}
    </div>
  );
}
