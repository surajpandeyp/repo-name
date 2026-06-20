// src/components/Navbar.jsx

import { useNavigate } from "react-router-dom";
import "../page/Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  // safe parse
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="navbar">

      {/* LEFT LOGO */}
      <div className="logo" onClick={() => navigate("/")}>
        🔐 Cyber Labs
      </div>

      
       {/* CENTER NAV */}
       {/*
      <div className="nav-links">
        <span onClick={() => navigate("/labs")}>Labs</span>
        <span onClick={() => navigate("/pivoting")}>Pivoting</span>
        <span onClick={() => navigate("/ctf")}>CTF</span>
       </div>
      */}
      {/* RIGHT USER */}
      <div className="user-box">

        <div className="user-info">
          👋 {user?.username || "Guest"}
        </div>

        <div className="avatar">
          {user?.username ? user.username.charAt(0).toUpperCase() : "G"}
        </div>

        <button onClick={logout}>
          Logout
        </button>

      </div>

    </div>
  );
}

export default Navbar;