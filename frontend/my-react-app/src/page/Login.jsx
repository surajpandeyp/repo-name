import { useState } from "react";
import { Link } from "react-router-dom";
import "../page/Login.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Input change handle
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Form submit handle
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    // Yaha baad me backend API call karoge
    // fetch("http://localhost:5000/login", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(formData),
    // });

    alert("Login Data Submitted");
  };

  return (
    <div className="container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Login</h1>

        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit">Login</button>
        <p className="signup-text">
            Dont have a account? <br />
            <Link to="/register">Sign Up</Link>
        </p>
         
      </form>
    </div>
  );
}

export default Login