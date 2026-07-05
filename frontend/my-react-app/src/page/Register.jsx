import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../page/Register.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    cpassword: "",
  });

  // Error state add ki hai
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (pass) => {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/;
    if (pass.length > 0 && !regex.test(pass)) {
      setPasswordError("Min 8 chars, 1 uppercase, 1 number, & 1 special char required.");
    } else {
      setPasswordError("");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Agar password field hai to validation run karo
    if (name === "password") {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check errors before submitting
    if (passwordError) {
      alert("Please fix password errors first.");
      return;
    }

    if (formData.password !== formData.cpassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/pivoting/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        navigate("/");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Register</h1>

        <input type="text" name="username" placeholder="Enter username" value={formData.username} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Enter email" value={formData.email} onChange={handleChange} required />
        
        <input type="password" name="password" placeholder="Enter password" value={formData.password} onChange={handleChange} required />
        
        {/* Error message yaha dikhega */}
        {passwordError && <p style={{ color: "red", fontSize: "12px", margin: "0" }}>{passwordError}</p>}

        <input type="password" name="cpassword" placeholder="Confirm password" value={formData.cpassword} onChange={handleChange} required />

        <button type="submit">Register</button>

        <p className="signup-text">
          Already have an account? <Link to="/"> Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;