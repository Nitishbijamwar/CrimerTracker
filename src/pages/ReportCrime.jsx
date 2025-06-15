import { useState } from "react";
import { db, auth } from "../services/firebase";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ReportCrime() {
  const [form, setForm] = useState({
    type: "",
    date: "",
    time: "",
    location: "",
    description: "",
  });

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadFileToCloudinary = async () => {
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "upload_Image"); // Your unsigned preset

      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dbqxdesnx/image/upload",
        data
      );

      return res.data.secure_url;
    } catch (err) {
      console.error(
        "❌ Cloudinary Upload Error:",
        err.response?.data || err.message
      );
      alert(
        "Cloudinary upload failed: " +
          (err.response?.data?.error?.message || err.message)
      );
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const fileUrl = file ? await uploadFileToCloudinary() : "";

      await addDoc(collection(db, "reports"), {
        ...form,
        fileUrl,
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        createdAt: new Date().toISOString(),
      });

      alert("✅ Crime report submitted successfully.");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Submit error:", err);
      alert("Submission failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 rounded-3xl shadow-2xl bg-gradient-to-br from-indigo-50 via-white to-blue-100 border border-indigo-200">
      <h2 className="text-4xl font-bold text-center text-indigo-700 mb-8">
        🚔 Report a Crime
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          required
          className="w-full border border-indigo-300 px-4 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Select Crime Type</option>
          <option value="Theft">Theft</option>
          <option value="Assault">Assault</option>
          <option value="Fraud">Fraud</option>
          <option value="Harassment">Harassment</option>
        </select>

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          className="w-full border border-indigo-300 px-4 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400"
        />

        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          required
          className="w-full border border-indigo-300 px-4 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400"
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
          className="w-full border border-indigo-300 px-4 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the incident..."
          required
          rows={4}
          className="w-full border border-indigo-300 px-4 py-3 rounded-xl shadow-sm resize-none focus:ring-2 focus:ring-indigo-400"
        />

        <div className="border-2 border-dashed border-indigo-300 p-4 rounded-xl bg-white hover:bg-indigo-50 transition-all">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Evidence (image/video)
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
          />
          {file && (
            <p className="mt-2 text-green-600 text-sm">
              ✅ Selected: {file.name}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className={`w-full py-3 text-white font-semibold rounded-xl shadow-md transition-all ${
            isUploading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isUploading ? "⏳ Uploading..." : "🚀 Submit Report"}
        </button>
      </form>
    </div>
  );
}
