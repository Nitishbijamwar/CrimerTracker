import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import axios from "axios";
import { sendPasswordResetEmail } from "firebase/auth";

export default function SettingsPanel({ activeTab }) {
  const [displayName, setDisplayName] = useState("");
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(false);
  const [photoURL, setPhotoURL] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDisplayName(data.displayName || "");
          setTheme(data.theme || "light");
          setPhotoURL(data.photoURL || "");
          setResetEmail(auth.currentUser.email); // Autofill email
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const uploadImage = async () => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "upload_Image");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dbqxdesnx/image/upload",
        formData
      );
      return res.data.secure_url;
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Image upload failed.");
      return null;
    }
  };

  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !displayName.trim()) return;

    setLoading(true);

    let newPhotoURL = photoURL;
    if (imageFile) {
      const uploadedURL = await uploadImage();
      if (uploadedURL) newPhotoURL = uploadedURL;
    }

    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        displayName: displayName.trim(),
        theme,
        photoURL: newPhotoURL,
      });
      setPhotoURL(newPhotoURL);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Error saving changes.");
    }

    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetStatus("Please enter an email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetStatus("Reset link sent! Check your email.");
    } catch (error) {
      console.error("Reset failed:", error);
      setResetStatus("Error sending reset email.");
    }
  };

  return (
    <div className="space-y-6">
      {activeTab === "profile" && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Profile Settings
          </h2>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">
              Upload New Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            />
          </div>

          <label className="block text-sm text-gray-600 mb-1">
            Display Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleSave}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {activeTab === "theme" && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Theme Settings
          </h2>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={theme === "dark"}
              onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-all relative">
              <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transform peer-checked:translate-x-5 transition-transform"></span>
            </div>
            <span className="ml-3 text-sm text-gray-700 font-medium">
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </span>
          </label>
        </div>
      )}

      {activeTab === "notifications" && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Notification Settings
          </h2>
          <p className="text-gray-600">Coming soon...</p>
        </div>
      )}

      {activeTab === "security" && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Security Settings
          </h2>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Send Reset Link
            </button>

            {resetStatus && (
              <p className="text-sm text-gray-600 mt-1">{resetStatus}</p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
