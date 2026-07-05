import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "../page/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="logo" onClick={() => navigate("/")}>🔐 HackRange</div>
      <div className="nav-links">
        <span onClick={() => navigate("/vpn")}>VPN</span>
        <span onClick={() => navigate("/labs")}>All Labs</span>
        <span onClick={() => navigate("/subscribe")}>Subscription</span>
      </div>
      <div className="user-box" ref={menuRef}>
        <div className="user-info">👋 {user?.username || "Guest"}</div>
        <div className="avatar" onClick={() => setOpen(!open)}>
          {user?.username ? user.username.charAt(0).toUpperCase() : "G"}
        </div>
        {open && (
          <div className="dropdown">
            <div className="dropdown-header">
              <div className="avatar large">{user?.username.charAt(0).toUpperCase()}</div>
              <div><h4>{user?.username}</h4></div>
            </div>
            <hr />
            <div className="dropdown-item" onClick={() => navigate("/profile")}>👤 Profile</div>
            <div className="dropdown-item" onClick={() => navigate("/sending")}>📤 Sending</div>
            <div className="dropdown-item" onClick={() => navigate("/settings")}>⚙ Settings</div>
            <hr />
            <div className="dropdown-item logout" onClick={logout}>🚪 Logout</div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Navbar;