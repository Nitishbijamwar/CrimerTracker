import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { Bell } from "lucide-react";

export default function Navbar() {
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribeNotifs = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserData(userData);

          // Listen for latest 5 notifications
          const notifQuery = query(
            collection(db, "notifications"),
            where("recipientId", "==", user.uid),
            orderBy("timestamp", "desc")
          );

          unsubscribeNotifs = onSnapshot(notifQuery, (snapshot) => {
            const all = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setNotifications(all);
          });
        }
      } else {
        setUserData(null);
        setNotifications([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeNotifs) unsubscribeNotifs();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="bg-blue-900 text-white flex justify-between items-center px-6 py-3 shadow-md flex-wrap relative">
      <h1 className="text-xl font-bold">CrimeTrack</h1>

      <ul className="flex gap-4 items-center flex-wrap">
        <li>
          <Link to="/" className="hover:text-yellow-300 transition">
            Home
          </Link>
        </li>

        {userData?.role === "user" && (
          <>
            <li>
              <Link to="/report" className="hover:text-yellow-300 transition">
                Report Crime
              </Link>
            </li>
            <li>
              <Link to="/witness" className="hover:text-yellow-300 transition">
                Witness Form
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="hover:text-yellow-300 transition"
              >
                Dashboard
              </Link>
            </li>
          </>
        )}

        {userData?.role === "lawyer" && (
          <li>
            <Link
              to="/lawyer-dashboard"
              className="hover:text-yellow-300 transition"
            >
              Lawyer Dashboard
            </Link>
          </li>
        )}

        {userData?.role === "admin" && (
          <li>
            <Link
              to="/admin-dashboard"
              className="hover:text-yellow-300 transition"
            >
              Admin Panel
            </Link>
          </li>
        )}

        {/* 🔔 Notification Bell with Dropdown */}
        {userData && (
          <li className="relative">
            <button
              className="relative hover:text-yellow-300 transition"
              onClick={() => setShowDropdown((prev) => !prev)}
              aria-label="Notifications"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* 🔽 Dropdown Notifications */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded shadow-lg z-10 max-h-72 overflow-auto">
                <div className="p-2 border-b font-semibold">Notifications</div>
                {notifications.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-2 text-sm border-b ${
                        !notif.read ? "bg-yellow-100" : ""
                      }`}
                    >
                      <p>{notif.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notif.timestamp?.toDate()).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
                <div className="p-2 text-center text-sm">
                  <Link
                    to="/notifications"
                    className="text-blue-600 hover:underline"
                    onClick={() => setShowDropdown(false)}
                  >
                    View All
                  </Link>
                </div>
              </div>
            )}
          </li>
        )}

        {/* 👤 User Info */}
        {userData && (
          <li className="text-sm italic text-gray-200">
            {userData.displayName || userData.name || userData.email || "User"}{" "}
            ({userData.role})
          </li>
        )}

        {/* 🔓 Logout */}
        {userData && (
          <li>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
