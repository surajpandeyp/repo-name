import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../page/Login.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/pivoting/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      alert(data.message);

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/labs");
      }
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Login</h1>

        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Sign In</button>

        <div className="footer-links">
          <p className="signup-text">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
          <Link to="/ForgotPassword">Forgot password?</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;