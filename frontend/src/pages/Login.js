import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ setToken }) {  // 🔥 accept setToken
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    if (!form.username || !form.password) {
      alert("Please fill all fields");
      return;
    }

    axios.post("http://localhost:8000/api/login/", form)
      .then(res => {
        // 🔥 SAVE DATA
        localStorage.setItem("token", res.data.access);
        localStorage.setItem("username", form.username);

        // 🔥 UPDATE APP STATE (IMPORTANT FIX)
        setToken(res.data.access);

        // 🔥 REDIRECT
        navigate("/dashboard");
      })
      .catch(err => {
        alert("Login failed!");
        console.error(err);
      });
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: "#f5f7fb"
    }}>

      {/* LEFT IMAGE SECTION */}
      <div style={{
        flex: 1,
        backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "20px",
        margin: "20px",
        display: "flex",
        alignItems: "flex-end",
        padding: "30px",
        color: "#fff"
      }}>
        <div>
          <h2>Welcome to HotelAI</h2>
          <p>Experience seamless hotel bookings powered by AI</p>
          <ul>
            <li>AI-powered room recommendations</li>
            <li>24/7 chatbot assistance</li>
            <li>Instant booking confirmation</li>
          </ul>
        </div>
      </div>

      {/* RIGHT LOGIN CARD */}
      <div style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{
          width: "350px",
          padding: "30px",
          borderRadius: "15px",
          background: "#fff",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>

          <h2 style={{textAlign: "center"}}>Welcome Back</h2>
          <p style={{textAlign: "center", color: "#777"}}>
            Sign in to manage your bookings
          </p>

          <input
            name="username"
            placeholder="Email Address"
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "15px",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          />

          <button
            onClick={handleSubmit}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "15px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Sign In
          </button>

          <p style={{textAlign: "center", marginTop: "15px"}}>
            Don’t have an account? <a href="/register">Sign up</a>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;