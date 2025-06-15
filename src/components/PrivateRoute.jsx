import { Navigate } from "react-router-dom";
import { auth } from "../services/firebase";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!auth.currentUser;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
