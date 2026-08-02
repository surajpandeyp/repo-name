import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { allLabs } from './LabData';
import './LabDetailPage.css';

function LabDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lab = allLabs.find((l) => String(l.id) === String(id));

  const [activeTab, setActiveTab] = useState('lab'); // 'lab', 'briefing', or 'details'
  const [isStarted, setIsStarted] = useState(false);
  const [machineIp, setMachineIp] = useState("");
  const [userFlag, setUserFlag] = useState("");
  const [flagStatus, setFlagStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [stopLoading, setStopLoading] = useState(false);

  const isInitialized = useRef(false);

  // Scroll to top whenever the page loads or activeTab changes
  useEffect(() => {
    window.scrollTo(0, 0);
    const container = document.querySelector('.lab-detail-container');
    if (container) {
      container.scrollTop = 0;
    }
  }, [activeTab, id]);

  useEffect(() => {
    if (isInitialized.current) return;
    const init = async () => {
      isInitialized.current = true;
      const token = localStorage.getItem("token");
      if (!token) { navigate("/"); return; }
      try {
        const authRes = await fetch("/api/pivoting/auth", {
          method: "POST",
          headers: { Authorization: "Bearer " + token }
        });
        if (authRes.status === 401) { navigate("/"); return; }
        const statusRes = await fetch(`/api/${lab.category}/status`, {
          headers: { Authorization: "Bearer " + token }
        });
        const statusData = await statusRes.json();
        if (statusData.success && statusData.running && String(statusData.labId) === String(id)) {
          setIsStarted(true);
          setMachineIp(statusData.ip);
        }
      } catch (err) { console.error("Init Error:", err); }
    };
    init();
    return () => { isInitialized.current = false; };
  }, [id, navigate, lab]);

  const handleStart = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch(`/api/${lab.category}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ labId: lab.id })
      });
      const data = await res.json();
      if(res.ok && data.success){
        setIsStarted(true);
        setMachineIp(data.ip);
      } else { alert(data.message || "Failed to start"); }

      if(data.message === "Subscription required"){
        navigate("/subcribe");
      }
    } catch (err) { alert("Error connecting to server"); }
    setLoading(false);
  };

  const handleStop = async () => {
    const token = localStorage.getItem("token");
    setStopLoading(true);
    try {
      const res = await fetch(`/api/${lab.category}/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ labId: lab.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsStarted(false);
        setMachineIp("");
      } else { alert("Failed to stop"); }
    } catch (err) { alert("Error connecting to server"); }
    finally { setStopLoading(false); }
  };

  const handleSubmitFlag = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/${lab.category}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ labId: lab.id, userFlag })
      });
      const data = await res.json();
      setFlagStatus(data.message);
    } catch (err) { alert("Flag submission failed"); }
  };

  if (!lab) return <div className="lab-detail-container"><h2>Lab not found!</h2></div>;

  return (
    <div className="lab-page-wrapper">
      {/* Top Nav Bar */}
      <div className="lab-top-nav">
        <div className="nav-left">
          <span className="app-brand">{lab.name}</span>
          {/* <button 
            className={`nav-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            🔒 VPN
          </button> */}

          <button className="feedback-btn" onClick={ () => navigate("/feedback")}>
            Feedback
          </button>

          <a 
          href="/configs/hacke.ovpn" 
          download="hackRangeUsers.ovpn" 
          className={`nav-tab ${activeTab === 'details' ? 'active' : ''}`}
          style={{ textDecoration: 'none', display: 'inline-block' }}
         >
            🔒 VPN
        </a>
          <button 
            className={`nav-tab ${activeTab === 'lab' ? 'active' : ''}`}
            onClick={() => setActiveTab('lab')}
          >
            📖 Lab
          </button>
          <button 
            className={`nav-tab ${activeTab === 'briefing' ? 'active' : ''}`}
            onClick={() => setActiveTab('briefing')}
          >
            📑 Overview
          </button>
        </div>
      </div>

      <div className="lab-detail-container">
        {activeTab === 'briefing' ? (
          <div className="briefing-view">
            <div className="briefing-content">
              <section id="about" className="briefing-section">
                <h2>About this lab</h2>
                <p>{lab.about || lab.description}</p>
              </section>

              <section id="objectives" className="briefing-section">
                <h2>Learning Objectives</h2>
                <p><strong>After completion of this lab, learners will be able to:</strong></p>
                <ul>
                  {lab.objectives && lab.objectives.length > 0 ? (
                    lab.objectives.map((obj, index) => (
                      <li key={index}>{obj}</li>
                    ))
                  ) : (
                    <li>Explore and exploit target application vulnerabilities.</li>
                  )}
                </ul>
              </section>

              <section id="description" className="briefing-section">
                <h2>Lab Description</h2>
                <p>{lab.labDescription || lab.description}</p>
              </section>
            </div>

            <div className="briefing-sidebar">
              <a href="#about">About this lab</a>
              <a href="#objectives">Learning Objectives</a>
              <a href="#description">Lab Description</a>
            </div>
          </div>
        ) : (
          <>
            <div className="lab-header-row">
              <h1 className="lab-title">{lab.name}</h1>
            </div>

            {/* Lab Briefing Banner */}
            <div className="card briefing-banner-card">
              <div className="briefing-banner-info">
                <h3>Lab Briefing</h3>
                <p>Note, the lab briefing may reveal instructions or clues.</p>
              </div>
              <button className="btn-view-briefing" onClick={() => setActiveTab('briefing')}>
                Overview
              </button>
            </div>

            {/* Machine Control Card */}
            <div className="card machine-control-card">
              <div className="machine-card-header">
                <span className="machine-icon">🖥️</span>
                <span className="machine-name">{lab.name}</span>
                <span className="status-dot"></span>
              </div>
              
              <div className="machine-action-area">
                <select className="target-select" disabled>
                  <option></option>
                </select>
                
                {isStarted ? (
                  <button className="btn-stop" onClick={handleStop} disabled={stopLoading}>
                    {stopLoading ? "Stopping..." : "■ Stop Machine"}
                  </button>
                ) : (
                  <button className="btn-start" onClick={handleStart} disabled={loading}>
                    {loading ? "Starting..." : "▶ Start"}
                  </button>
                )}
              </div>
              <p className="machine-subtext">Start the machine to use Kali in-browser.</p>
              {isStarted && <p className="ip-display">Machine IP: {machineIp}</p>}
            </div>

            {/* Tasks / Flag Submission Card */}
            <div className="card task-card">
              <div className="task-header">
                <h3>Task</h3>
                <div className="task-status-indicator"></div>
              </div>
              
              <h4 className="card-title">Submit Flags</h4>
              <p className="card-text">Find the user and root flags</p>
              
              <div className="flag-input-wrapper">
                <input 
                  className="flag-input" 
                  value={userFlag} 
                  onChange={(e) => setUserFlag(e.target.value)} 
                  placeholder={isStarted ? "Enter root flag..." : "Start the machine to begin the lab..."} 
                  disabled={!isStarted} 
                />
                <button className="btn-flag-submit-icon" onClick={handleSubmitFlag} disabled={!isStarted}>
                  ➢
                </button>
              </div>
              {flagStatus && <p className="flag-status">{flagStatus}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LabDetailPage;