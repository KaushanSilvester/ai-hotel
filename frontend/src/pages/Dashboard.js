import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  const fetchBookings = () => {
    axios.get("http://localhost:8000/api/my-bookings/", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      setBookings(res.data);
    })
    .catch(err => {
      console.error(err.response?.data);
      setBookings([]); // 🔥 prevent crash
    });
  };

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, []);

  // 🔥 CANCEL FUNCTION
  const handleCancel = (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    axios.delete(`http://localhost:8000/api/cancel/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(() => {
      alert("Booking cancelled!");
      fetchBookings(); // refresh
    })
    .catch(err => {
      console.error(err.response?.data);
      alert("Cancel failed!");
    });
  };

  return (
    <div style={{
      padding: "20px",
      background: "#f5f5f5",
      minHeight: "100vh"
    }}>
      <h2 style={{textAlign: "center"}}>Dashboard</h2>

      <p style={{textAlign: "center", marginBottom: "20px"}}>
        Welcome, <b>{username}</b>
      </p>

      <h3 style={{textAlign: "center"}}>My Bookings</h3>

      {bookings.length === 0 ? (
        <p style={{textAlign: "center"}}>No bookings yet</p>
      ) : (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px"
        }}>
          {bookings.map(b => (
            <div 
              key={b.id} 
              style={{
                width: "280px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: "15px",
                background: "#fff",
                transition: "0.3s"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <h3 style={{marginBottom: "10px"}}>{b.room}</h3>

              <p>📅 <b>Check-in:</b> {b.check_in}</p>
              <p>📅 <b>Check-out:</b> {b.check_out}</p>

              <button 
                onClick={() => handleCancel(b.id)}
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "10px",
                  background: "red",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Cancel Booking
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;