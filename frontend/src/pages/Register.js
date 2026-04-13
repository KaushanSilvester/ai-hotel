import { useState } from "react";
import axios from "axios";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    axios.post("http://localhost:8000/api/register/", form)
      .then(res => {
        alert("User registered successfully!");
      })
      .catch(err => {
        alert("Registration failed!");
        console.error(err);
      });
  };

  return (
    <div>
      <h2>Register</h2>

      <input name="username" placeholder="Username" onChange={handleChange} /><br />
      <input name="email" placeholder="Email" onChange={handleChange} /><br />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} /><br />

      <button onClick={handleSubmit}>Register</button>
    </div>
  );
}

export default Register;