import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../services/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  addDoc,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { predictOutcome, analyzeComplexity } from "../utils/aiUtils";

export default function CaseDetails() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [lawyers, setLawyers] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState("");
  const [userRole, setUserRole] = useState("");
  const [lawyerComments, setLawyerComments] = useState([]);
  const [comment, setComment] = useState("");
  const [commentFile, setCommentFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch user role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setUserRole(snapshot.docs[0].data().role);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch case, lawyers, and comments
  useEffect(() => {
    const fetchCase = async () => {
      const caseRef = doc(db, "reports", caseId);
      const caseSnap = await getDoc(caseRef);
      if (caseSnap.exists()) {
        const data = caseSnap.data();
        setCaseData(data);
        setSelectedLawyer(data.assignedLawyerId || "");
      }
    };

    const fetchLawyers = async () => {
      const q = query(collection(db, "users"), where("role", "==", "lawyer"));
      const snapshot = await getDocs(q);
      const lawyersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLawyers(lawyersList);
    };

    const fetchComments = async () => {
      const q = query(
        collection(db, "reports", caseId, "lawyerComments"),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const comments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLawyerComments(comments);
    };

    fetchCase();
    fetchLawyers();
    fetchComments();
  }, [caseId]);

  const handleAssign = async () => {
    if (!selectedLawyer) return alert("Please select a lawyer.");
    const selected = lawyers.find((l) => l.id === selectedLawyer);
    if (!selected) return alert("Selected lawyer not found.");

    try {
      await updateDoc(doc(db, "reports", caseId), {
        assignedLawyerId: selected.id,
        assignedLawyerEmail: selected.email,
      });

      await addDoc(collection(db, "admin_logs"), {
        adminId: auth.currentUser.uid,
        adminEmail: auth.currentUser.email,
        action: "Assigned Lawyer from CaseDetails",
        reportId: caseId,
        assignedLawyerEmail: selected.email,
        timestamp: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        recipientId: selected.uid,
        message: `You have been assigned a new case: ${caseId}`,
        reportId: caseId,
        read: false,
        timestamp: serverTimestamp(),
      });

      alert("Case assigned successfully.");
      setCaseData((prev) => ({
        ...prev,
        assignedLawyerId: selected.id,
        assignedLawyerEmail: selected.email,
      }));
    } catch (error) {
      console.error("Assignment failed:", error);
      alert("Failed to assign lawyer.");
    }
  };

  const handleCommentUpload = async () => {
    if (!comment) return alert("Please enter a comment.");
    setUploading(true);
    let uploadedUrl = "";

    if (commentFile) {
      const formData = new FormData();
      formData.append("file", commentFile);
      formData.append("upload_preset", "upload_Image");

      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dbqxdesnx/upload",
          { method: "POST", body: formData }
        );
        const data = await res.json();
        uploadedUrl = data.secure_url;
      } catch (err) {
        console.error("File upload failed:", err);
        alert("Failed to upload file.");
        setUploading(false);
        return;
      }
    }

    try {
      await addDoc(collection(db, "reports", caseId, "lawyerComments"), {
        comment,
        fileUrl: uploadedUrl || null,
        lawyerEmail: auth.currentUser.email,
        timestamp: serverTimestamp(),
      });

      setComment("");
      setCommentFile(null);
      setUploading(false);
      alert("Comment uploaded successfully.");

      const q = query(
        collection(db, "reports", caseId, "lawyerComments"),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const comments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLawyerComments(comments);
    } catch (err) {
      console.error("Comment upload error:", err);
      alert("Failed to save comment.");
      setUploading(false);
    }
  };

  if (!caseData)
    return <div className="text-center mt-10 text-gray-600">Loading...</div>;

  if (
    userRole === "lawyer" &&
    auth.currentUser?.email !== caseData.assignedLawyerEmail
  ) {
    return (
      <div className="text-center mt-10 text-red-500 font-semibold">
        You are not authorized to view this case.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-2xl p-8 mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-indigo-700">📂 Case Details</h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-200 text-sm text-gray-800 px-4 py-1 rounded hover:bg-gray-300"
        >
          🔙 Back
        </button>
      </div>

      <div className="space-y-3 text-gray-800">
        <p>
          <strong>🚨 Type:</strong> {caseData.type}
        </p>
        <p>
          <strong>📅 Date:</strong> {caseData.date}
        </p>
        <p>
          <strong>🗺️ Location:</strong> {caseData.location}
        </p>
        <p>
          <strong>📝 Description:</strong> {caseData.description}
        </p>
        <p>
          <strong>⏳ Status:</strong> {caseData.status || "Not Updated"}
        </p>

        <p>
          <strong>👨‍⚖️ Assigned Lawyer:</strong>{" "}
          {lawyers.find((l) => l.id === caseData.assignedLawyerId)?.name ||
            caseData.assignedLawyerEmail ||
            "Not Assigned"}
        </p>
      </div>

      <div className="mt-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg">
        <p className="font-bold text-yellow-800">🧠 Predicted Outcome</p>
        <p className="italic text-gray-700 text-sm mt-1">
          {predictOutcome(caseData) || "Unable to predict at this time."}
        </p>
      </div>

      <div className="mt-4 p-4 bg-blue-100 border-l-4 border-blue-500 rounded-lg">
        <p className="font-bold text-blue-800">📊 Case Complexity</p>
        <p className="text-gray-800 mt-1">{analyzeComplexity(caseData)}</p>
      </div>

      {caseData.evidenceUrls?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2 text-gray-700">
            📎 Evidence Files:
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {caseData.evidenceUrls.map((url, index) => (
              <div key={index} className="border p-2 rounded bg-white">
                {url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                  <img
                    src={url}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                ) : (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    📄 View File {index + 1}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {userRole === "admin" && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border shadow">
          <label className="block mb-2 font-semibold text-gray-700">
            Assign to Lawyer:
          </label>
          <select
            className="w-full p-2 border rounded mb-4"
            value={selectedLawyer}
            onChange={(e) => setSelectedLawyer(e.target.value)}
          >
            <option value="">-- Select Lawyer --</option>
            {lawyers.map((lawyer) => (
              <option key={lawyer.id} value={lawyer.id}>
                {lawyer.name || lawyer.email}
              </option>
            ))}
          </select>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            onClick={handleAssign}
          >
            Assign / Reassign Case
          </button>
        </div>
      )}

      {userRole === "lawyer" &&
        auth.currentUser?.email === caseData.assignedLawyerEmail && (
          <div className="mt-6 bg-white p-4 border rounded shadow">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              ➕ Add New Comment & File
            </h4>
            <textarea
              rows={4}
              className="w-full border border-gray-300 rounded p-2 mb-3"
              placeholder="Enter your comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <input
              type="file"
              onChange={(e) => setCommentFile(e.target.files[0])}
              className="mb-4"
            />
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
              onClick={handleCommentUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Comment"}
            </button>
          </div>
        )}

      <div className="mt-6 bg-gray-50 border rounded p-4">
        <h4 className="text-md font-bold text-gray-800 mb-3">
          📚 Previous Comments
        </h4>
        {lawyerComments.length > 0 ? (
          <ul className="space-y-3">
            {lawyerComments.map((cmt) => (
              <li
                key={cmt.id}
                className="p-3 bg-white border rounded shadow-sm"
              >
                <p className="text-sm text-gray-800 mb-1">{cmt.comment}</p>
                {cmt.fileUrl && (
                  <a
                    href={cmt.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    📄 View Attachment
                  </a>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  — {cmt.lawyerEmail},{" "}
                  {cmt.timestamp?.toDate().toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No comments yet.</p>
        )}
      </div>
    </div>
  );
}
