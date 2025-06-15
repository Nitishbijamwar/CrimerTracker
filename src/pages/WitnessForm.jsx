import { useState } from "react";
import { db } from "../services/firebase";
import { addDoc, collection } from "firebase/firestore";
import axios from "axios";

export default function WitnessForm() {
  const [formData, setFormData] = useState({
    witnessName: "",
    caseId: "",
    testimony: "",
    fileUrl: "",
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadFileToCloudinary = async () => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "upload_Image");

    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/dbqxdesnx/image/upload",
      data
    );

    return res.data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let uploadedUrl = "";
      if (file) {
        uploadedUrl = await uploadFileToCloudinary();
      }

      const witnessData = {
        ...formData,
        fileUrl: uploadedUrl,
        timestamp: new Date().toISOString(),
      };

      await addDoc(collection(db, "witness_reports"), witnessData);
      alert("✅ Witness report submitted successfully!");

      setFormData({ witnessName: "", caseId: "", testimony: "", fileUrl: "" });
      setFile(null);
    } catch (error) {
      console.error("Error submitting witness report:", error);
      alert("❌ Submission failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] bg-gradient-to-br from-white via-indigo-50 to-purple-50 border border-gray-200">
      <h2 className="text-4xl font-extrabold text-center text-indigo-700 mb-10 tracking-wide">
        🧾 Submit Witness Report
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Your Name (Optional)
          </label>
          <input
            type="text"
            name="witnessName"
            value={formData.witnessName}
            onChange={handleInputChange}
            className="w-full border border-indigo-200 px-4 py-3 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
        </div>

        {/* Case ID */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Case ID / Reference <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="caseId"
            value={formData.caseId}
            onChange={handleInputChange}
            required
            className="w-full border border-indigo-200 px-4 py-3 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
        </div>

        {/* Testimony */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Testimony <span className="text-red-500">*</span>
          </label>
          <textarea
            name="testimony"
            value={formData.testimony}
            onChange={handleInputChange}
            required
            rows={5}
            className="w-full border border-indigo-200 px-4 py-3 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none"
          />
        </div>

        {/* File Upload - styled */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700">
            Upload Image/Video (Optional)
          </label>
          <div className="border-dashed border-2 border-indigo-300 bg-indigo-50 hover:bg-indigo-100 transition rounded-xl p-6 text-center">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-indigo-800 file:hidden cursor-pointer"
            />
            <p className="text-indigo-600 font-medium">
              📂 Choose a file or drag & drop
            </p>
            {file && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {file.name}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 text-white font-semibold rounded-xl transition duration-200 ease-in-out shadow-lg ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105"
          }`}
        >
          {isSubmitting ? "⏳ Submitting..." : "🚀 Submit Report"}
        </button>
      </form>
    </div>
  );
}
