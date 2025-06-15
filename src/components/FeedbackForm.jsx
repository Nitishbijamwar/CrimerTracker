import { useState } from "react";
import { db } from "../services/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.message.trim()) {
      setStatus("Please enter your feedback.");
      return;
    }

    try {
      await addDoc(collection(db, "feedback"), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      setStatus("Feedback submitted successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setStatus("Error submitting feedback. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white p-6 rounded shadow space-y-4"
    >
      <h2 className="text-2xl font-bold text-center text-blue-700">Feedback</h2>

      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Your Name (optional)"
        className="w-full border p-3 rounded"
      />

      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Your Email (optional)"
        className="w-full border p-3 rounded"
      />

      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Your Feedback"
        className="w-full border p-3 rounded h-32 resize-none"
        required
      />

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
      >
        Submit Feedback
      </button>

      {status && <p className="text-center text-sm text-green-600">{status}</p>}
    </form>
  );
}
