import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import GlobalChat from "./pages/GlobalChat";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private */}
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <GlobalChat />
            </PrivateRoute>
          }
        />

        {/* Safety redirects (Dashboard/Rooms removed) */}
        <Route path="/dashboard" element={<Navigate to="/chat" replace />} />
        <Route path="/rooms" element={<Navigate to="/chat" replace />} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
