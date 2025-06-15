import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe;

    const listenForUser = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const q = query(
        collection(db, "notifications"),
        where("recipientId", "==", user.uid),
        orderBy("timestamp", "desc")
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const allNotifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(allNotifications);
        setUnreadCount(allNotifications.filter((n) => !n.read).length);
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleBellClick = async () => {
    setOpenDropdown((prev) => !prev);

    // Mark all as read when opening dropdown
    if (!openDropdown) {
      const user = auth.currentUser;
      if (!user) return;
      const unread = notifications.filter((n) => !n.read);
      unread.forEach(async (n) => {
        const ref = doc(db, "notifications", n.id);
        await updateDoc(ref, { read: true });
      });
    }
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleBellClick}
        className="relative text-white hover:text-yellow-300 focus:outline-none"
        title="View Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] text-white rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {openDropdown && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg z-50 max-h-80 overflow-y-auto border border-gray-200">
          <div className="p-3 font-semibold border-b bg-gray-100 text-gray-700">
            Notifications
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">No notifications</div>
          ) : (
            <ul className="divide-y">
              {notifications.slice(0, 10).map((note) => (
                <li key={note.id} className="px-4 py-3 hover:bg-gray-50">
                  <div className="text-sm text-gray-800">{note.message}</div>
                  <div className="text-xs text-gray-500">
                    {note.timestamp?.toDate().toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button
            className="w-full text-sm text-blue-600 hover:underline py-2"
            onClick={() => navigate("/admin-dashboard")} // Adjust route if needed
          >
            View All
          </button>
        </div>
      )}
    </div>
  );
}
