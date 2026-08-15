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
      {/* Premium Cyber Terminal Logo Structure */}
      <div className="logo-container" onClick={() => navigate("/")}>
        <div className="cyber-terminal-logo">
          <span className="terminal-prompt">&gt;_</span>
        </div>
        <span className="brand-name">
          Hack<span className="brand-accent">Range</span>
        </span>
      </div>

      <div className="nav-links">
        <span onClick={() => navigate("/vpn-setup")}>VPN Setup</span>
        <span onClick={() => navigate("/labs")}>All Labs</span>
        <span onClick={() => navigate("/subscribe")}>Subscription</span>
        <span onClick={() => navigate("/About")}>About-labs</span>
      </div>

      <div className="user-box" ref={menuRef}>
        <div className="user-info">👋 {user?.username || "Guest"}</div>
        <div className="avatar" onClick={() => setOpen(!open)}>
          {user?.username ? user.username.charAt(0).toUpperCase() : "G"}
        </div>
        {open && (
          <div className="dropdown">
            <div className="dropdown-header">
              <div className="avatar large">{user?.username ? user.username.charAt(0).toUpperCase() : "G"}</div>
              <div><h4>{user?.username || "Guest"}</h4></div>
            </div>
            <hr />  
            <div className="dropdown-item" onClick={() => navigate("/profile")}>👤 Profile</div>
            <div className="dropdown-item" onClick={() => navigate("/sending")}>📤 Sending</div>    
            <div className="dropdown-item" onClick={() => navigate("/settings")}>⚙ Settings</div>
            <div className="dropdown-item" onClick={() => navigate("/ssueForm")}>📤 Support</div>
            <div className="dropdown-item" onClick={() => navigate("/subcriptionpage")}>📅 Billing history</div>
            <hr />
            <div className="dropdown-item logout" onClick={logout}>🚪 Logout</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;