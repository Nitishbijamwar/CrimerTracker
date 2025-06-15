import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

import ReportsPanel from "../components/ReportPannel";
import ChartPanel from "../components/ChartPannel";
import UserPanel from "../components/UserPannel";
import SettingsPanel from "../components/SettingPannel";
import FeedbackPanel from "../components/FeedbackPannel";

export default function AdminDashboard() {
  const [activePanel, setActivePanel] = useState("reports");
  const [settingsTab, setSettingsTab] = useState("profile");
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminPhoto, setAdminPhoto] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    const fetchAdminData = async () => {
      const user = auth.currentUser;
      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setAdminName(data.displayName || data.name || "Admin");
          setAdminPhoto(data.photoURL || "");
          setAdminEmail(user.email || "");
        }
      }
    };
    fetchAdminData();
  }, [activePanel]);

  const renderPanel = () => {
    switch (activePanel) {
      case "reports":
        return <ReportsPanel />;
      case "charts":
        return <ChartPanel />;
      case "users":
        return <UserPanel />;
      case "feedback":
        return <FeedbackPanel />;
      case "settings":
        return <SettingsPanel activeTab={settingsTab} />;
      default:
        return <ReportsPanel />;
    }
  };

  const getInitials = () => {
    if (adminName) {
      return adminName
        .split(" ")
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    } else if (adminEmail) {
      return adminEmail.slice(0, 2).toUpperCase();
    }
    return "AD";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white shadow-md p-6 md:h-screen space-y-6">
        <div className="flex flex-col items-center">
          {adminPhoto ? (
            <img
              src={adminPhoto}
              alt="Admin"
              className="w-20 h-20 rounded-full object-cover mb-2"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-2">
              {getInitials()}
            </div>
          )}
          <h2 className="text-lg font-semibold text-gray-800">{adminName}</h2>
        </div>

        <nav className="flex flex-col gap-4">
          {[
            { label: "Reports", value: "reports" },
            { label: "Charts", value: "charts" },
            { label: "Users", value: "users" },
            { label: "Feedback", value: "feedback" },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => {
                setActivePanel(btn.value);
                setShowSettingsDropdown(false);
              }}
              className={`transition-all duration-200 w-full px-4 py-3 text-left rounded-lg font-medium 
                ${
                  activePanel === btn.value
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-800 hover:bg-blue-100 hover:scale-[1.02]"
                } focus:outline-none focus:ring-2 focus:ring-blue-400`}
            >
              {btn.label}
            </button>
          ))}

          {/* Settings dropdown */}
          <div>
            <button
              onClick={() => {
                setActivePanel("settings");
                setShowSettingsDropdown(!showSettingsDropdown);
              }}
              className={`w-full px-4 py-3 text-left rounded-lg font-medium transition-all duration-200 ${
                activePanel === "settings"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-800 hover:bg-blue-100 hover:scale-[1.02]"
              }`}
            >
              Settings
            </button>

            {showSettingsDropdown && (
              <div className="ml-4 mt-2 flex flex-col gap-2">
                {["profile", "theme", "notifications", "security"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setSettingsTab(tab)}
                      className={`text-left px-3 py-2 rounded text-sm ${
                        settingsTab === tab
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-blue-100"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 capitalize">
          {activePanel}
        </h1>
        <div className="bg-white p-6 rounded-lg shadow">{renderPanel()}</div>
      </main>
    </div>
  );
}
