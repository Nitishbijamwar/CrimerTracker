import { useState } from "react";
import { auth, db } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // default role
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save user role in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email,
        role,
      });

      alert("Registration successful. Please log in.");
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-300 via-purple-200 to-indigo-300 px-4">
      <div className="backdrop-blur-xl bg-white/50 border border-white/30 shadow-2xl rounded-3xl p-10 w-full max-w-md transition-transform transform hover:scale-105 duration-500">
        <h2 className="text-4xl font-extrabold text-center text-purple-700 mb-6 drop-shadow-md">
          Create an Account
        </h2>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-inner transition-all duration-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a password"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-inner transition-all duration-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-inner transition-all duration-300"
            >
              <option value="user">User</option>
              <option value="lawyer">Lawyer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold text-lg shadow-lg hover:shadow-2xl transition duration-300"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?
          <button
            type="button"
            onClick={handleLoginRedirect}
            className="text-purple-700 font-medium hover:underline ml-1"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
