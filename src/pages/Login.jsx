import { useState } from "react";
import { auth, db } from "../services/firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (!userData?.role) {
        alert("User role not found. Please contact admin.");
        return;
      }

      alert("Login successful");

      switch (userData.role) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "lawyer":
          navigate("/lawyer-dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleNavigateToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-300 via-blue-200 to-cyan-300 px-4">
      <div className="backdrop-blur-xl bg-white/50 border border-white/30 shadow-2xl rounded-3xl p-10 w-full max-w-md transition-transform transform hover:scale-105 duration-500">
        <h2 className="text-4xl font-extrabold text-center text-indigo-700 mb-6 drop-shadow-md">
          Login to Your Account
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-inner transition-all duration-300"
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
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-inner transition-all duration-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-indigo-600 hover:underline font-medium"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold text-lg shadow-lg hover:shadow-2xl transition duration-300"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?
          <button
            type="button"
            onClick={handleNavigateToRegister}
            className="text-indigo-700 font-medium hover:underline ml-1"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
