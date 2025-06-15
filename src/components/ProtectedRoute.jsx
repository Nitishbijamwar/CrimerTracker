import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ProtectedRoute({ children, allowedRoles }) {
  const [checking, setChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAllowed(false);
        setChecking(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const role = userDoc.exists() ? userDoc.data().role : null;

        if (allowedRoles.includes(role)) {
          setIsAllowed(true);
        } else {
          setIsAllowed(false);
        }
      } catch (error) {
        console.error("Role check failed:", error);
        setIsAllowed(false);
      }

      setChecking(false);
    });

    return () => unsubscribe(); // Clean up
  }, [allowedRoles]);

  if (checking) {
    return <div className="text-center mt-10">Checking access...</div>;
  }

  return isAllowed ? children : <Navigate to="/login" replace />;
}
