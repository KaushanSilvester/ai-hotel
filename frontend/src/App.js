import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
  };

  return (
    <Router>

      {/* 🔥 MODERN NAVBAR */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
        background: "#1e293b",
        color: "#fff"
      }}>
        
        {/* LEFT */}
        <div>
          <Link to="/" style={{color: "#fff", marginRight: "15px", textDecoration: "none"}}>
            🏨 HotelAI
          </Link>

          {token && (
            <Link to="/dashboard" style={{color: "#fff", textDecoration: "none"}}>
              Dashboard
            </Link>
          )}
        </div>

        {/* RIGHT */}
        <div>
          {!token ? (
            <>
              <Link to="/login" style={{color: "#fff", marginRight: "10px"}}>
                Login
              </Link>
              <Link to="/register" style={{color: "#fff"}}>
                Register
              </Link>
            </>
          ) : (
            <>
              <span style={{marginRight: "10px"}}>
                👤 {username}
              </span>
              <button 
                onClick={handleLogout}
                style={{
                  padding: "6px 10px",
                  background: "#ef4444",
                  border: "none",
                  color: "#fff",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {/* 🔥 ROUTES */}
      <Routes>
        <Route path="/" element={<Home />} />

        <Route 
          path="/login" 
          element={!token ? <Login setToken={setToken} /> : <Navigate to="/dashboard" />} 
        />

        <Route 
          path="/register" 
          element={!token ? <Register /> : <Navigate to="/dashboard" />} 
        />

        <Route 
          path="/dashboard" 
          element={token ? <Dashboard /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;