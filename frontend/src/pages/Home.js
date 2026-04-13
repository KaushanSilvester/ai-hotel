import { useEffect, useState } from "react";
import axios from "axios";

function Home() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);

  const [favorites, setFavorites] = useState([]);

  const [maxPrice, setMaxPrice] = useState(10000);
  const [guests, setGuests] = useState(1);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [roomType, setRoomType] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [selectedAmenities, setSelectedAmenities] = useState({
    wifi: false,
    ac: false,
    tv: false
  });

  useEffect(() => {
    axios.get("http://localhost:8000/api/rooms/")
      .then(res => {
        setRooms(res.data);
        setFilteredRooms(res.data);
      });
  }, []);

  const handleAmenityChange = (e) => {
    setSelectedAmenities({
      ...selectedAmenities,
      [e.target.name]: e.target.checked
    });
  };

  const applyFilters = () => {
    let filtered = rooms.filter(room => {
      return (
        room.price <= maxPrice &&
        room.capacity >= guests &&
        (!selectedAmenities.wifi || room.wifi) &&
        (!selectedAmenities.ac || room.ac) &&
        (!selectedAmenities.tv || room.tv) &&
        (!roomType || room.room_type === roomType)
      );
    });

    if (sortOrder === "low") {
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOrder === "high") {
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
    }

    setFilteredRooms(filtered);
  };

  const handleBooking = (roomId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login first!");
      return;
    }

    if (!checkIn || !checkOut) {
      alert("Select dates!");
      return;
    }

    if (checkOut <= checkIn) {
      alert("Check-out must be after check-in!");
      return;
    }

    axios.post("http://localhost:8000/api/book/", {
      room_id: roomId,
      check_in: checkIn,
      check_out: checkOut
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => alert("Booked!"))
    .catch(() => alert("Booking failed!"));
  };

  // ❤️ FAVORITE TOGGLE
  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  return (
    <div style={{padding: "20px", background: "#f7f7f7", minHeight: "100vh"}}>

      {/* TOP BAR */}
      <div style={{
        background: "#fff",
        padding: "15px",
        marginBottom: "20px",
        borderRadius: "10px",
        display: "flex",
        justifyContent: "space-between"
      }}>
        <h2>🏨 HotelAI</h2>
      </div>

      <div style={{display: "flex"}}>

        {/* FILTER */}
        <div style={{
          width: "260px",
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          marginRight: "20px"
        }}>
          <h3>Filters</h3>

          <h4>Room Type</h4>
          <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
            <option value="">All</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="suite">Suite</option>
          </select>

          <h4>Sort</h4>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="">None</option>
            <option value="low">Low → High</option>
            <option value="high">High → Low</option>
          </select>

          <label>Max Price</label>
          <input type="range" min="0" max="10000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)} />

          <label>Guests</label>
          <input type="number" value={guests}
            onChange={(e) => setGuests(e.target.value)} />

          <h4>Dates</h4>
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />

          <button onClick={applyFilters}>Apply</button>
        </div>

        {/* ROOMS */}
        <div style={{flex: 1}}>
          <h2>Rooms</h2>

          {filteredRooms.map(room => (
            <div key={room.id} style={{
              display: "flex",
              background: "#fff",
              marginBottom: "20px",
              borderRadius: "12px",
              overflow: "hidden",
              position: "relative"
            }}>

              {/* ❤️ HEART */}
              <span 
                onClick={() => toggleFavorite(room.id)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  cursor: "pointer",
                  fontSize: "20px"
                }}
              >
                {favorites.includes(room.id) ? "❤️" : "🤍"}
              </span>

              {room.image && (
                <img 
                  src={room.image}
                  style={{width: "220px", cursor: "pointer"}}
                  onClick={() => setSelectedRoom(room)}
                />
              )}

              <div style={{padding: "15px"}}>
                <h3>{room.room_type}</h3>

                <p>👤 {room.capacity} guests</p>

                <p>💰 Rs. {room.price}</p>

                {/* ⭐ RATING */}
                <p style={{color: "#f59e0b", fontWeight: "bold"}}>
                  ⭐ {(Math.random() * 2 + 3).toFixed(1)} (100 reviews)
                </p>

                <button onClick={() => handleBooking(room.id)}>
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* POPUP */}
      {selectedRoom && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{background: "#fff", padding: "20px"}}>
            <h2>{selectedRoom.room_type}</h2>

            {(() => {
              const images = [
                selectedRoom.image,
                selectedRoom.image2,
                selectedRoom.image3
              ].filter(Boolean);

              return (
                <>
                  <img src={images[currentImageIndex]} style={{width: "400px"}} />

                  <div>
                    <button onClick={() =>
                      setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1)
                    }>⬅️</button>

                    <button onClick={() =>
                      setCurrentImageIndex(currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0)
                    }>➡️</button>
                  </div>
                </>
              );
            })()}

            <button onClick={() => {
              setSelectedRoom(null);
              setCurrentImageIndex(0);
            }}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Home;