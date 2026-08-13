import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Redirect karne ke liye useNavigate import kiya
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate(); // Navigation initialize kiya

  const [activeTab, setActiveTab] = useState('Profile Settings');
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [timeFilter, setTimeFilter] = useState('1 month');

  // Backend se dynamic data store karne ke liye states
  const [username, setUsername] = useState("");
  const [xp, setXp] = useState("0h");
  const [flag, setFlag] = useState(0);
  const [labsCompleted, setLabsCompleted] = useState(0); // Labs completed ki state bhi add kar di
  const [loading, setLoading] = useState(true);

  // Page load hote hi data fetch karne ke liye useEffect
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      
      try {
        const res = await fetch("/api/profile", {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token, 
          }
        });

        if (!res.ok) {
          throw new Error("Token invalid ");
        }

        const data = await res.json();
        console.log(data);
        
        
        // Backend se aaye hue data ko state me set kiya
        setUsername(data.user);
        setXp(data.totleXp || "0h");
        setFlag(data.totleFlag || 0);
        setLabsCompleted(data.totleCountLab || 0); // Agar backend labs bhej raha hai
        
        setLoading(false); // Data milte hi loading khatam!
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
        navigate("/"); // Agar token expire ho ya error aaye toh home/login page par bhej do
      }
    };

    fetchProfile();
  }, [navigate]);

  // Loading Screen jab tak backend se response nahi aata
  if (loading) {
    return <div className="loading" style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px' }}>Loading Profile Data...</div>;
  }

  return (
    <div className="profile-container">
      {/* Top Navigation (Commented) */}
      {/* 
      <div className="top-nav">
        {['Profile Settings'].map((tab) => (
          <button
            key={tab}
            className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      */}

      {/* My Profile Header Card */}
      <div className="profile-header-card">
        <div className="card-title-bar">
          <h2>My Profile <span className="info-icon">ⓘ</span></h2>
          <div className="action-buttons">
            {/* <button className="edit-btn">✎ Edit</button>
            <button className="share-btn">🔗 Share</button> */}
          </div>
        </div>

        <div className="user-info-section">
          <div className="avatar-box">
            {/* Username ka pehla letter dynamic avatar ke liye safely check karke */}
            {username ? username.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="user-details">
            <h3>
              {username} <span className="badge"></span>
            </h3>
            {/* <p className="location">📍 India</p> */}
          </div>
        </div>
      </div>

      {/* Sub Navigation (Commented) */}
      {/* 
      <div className="sub-nav">
        {['Skills'].map((subTab) => (
          <button
            key={subTab}
            className={`nav-btn ${activeSubTab === subTab ? 'active' : ''}`}
            onClick={() => setActiveSubTab(subTab)}
          >
            {subTab}
          </button>
        ))}
      </div>
      */}

      {/* Overview Content */}
      <div className="overview-heading">
        <h3>Overview</h3>
        <p>Track your progress.</p>
      </div>

      {/* Stats Grid Cards - Dynamic Data */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔬</div>
          <div className="stat-info">
            <span className="stat-label">Labs completed</span>
            <span className="stat-value">{labsCompleted}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <span className="stat-label">Xp</span>
            <span className="stat-value">{xp}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏳️</div>
          <div className="stat-info">
            <span className="stat-label">Flags captured</span>
            <span className="stat-value">{flag}</span>
          </div>
        </div>
      </div>

      {/* Learning Timeline Graph Section */}
      <div className="timeline-section">
        <div className="timeline-header">
          <h4>Learning Timeline <span>(Last 30 days)</span></h4>
          <div className="time-filter">
            {['1 month', '3 months', '6 months'].map((filter) => (
              <button
                key={filter}
                className={`filter-btn ${timeFilter === filter ? 'active' : ''}`}
                onClick={() => setTimeFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        
        {/* Graph Placeholder Structure */}
        <div className="dummy-graph">
          <div className="y-axis-label" style={{ top: '10px' }}>2</div>
          <div className="y-axis-label" style={{ top: '60px' }}>1.5</div>
          <div className="y-axis-label" style={{ top: '110px' }}>1</div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;