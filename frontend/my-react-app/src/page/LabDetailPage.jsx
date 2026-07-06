import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { allLabs } from './LabData';
import './LabDetailPage.css';

function LabDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lab = allLabs.find((l) => String(l.id) === String(id));
  
  const [isStarted, setIsStarted] = useState(false);
  const [machineIp, setMachineIp] = useState("");
  const [userFlag, setUserFlag] = useState("");
  const [flagStatus, setFlagStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [stopLoading, setStopLoading] = useState(false);

  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    const init = async () => {
      isInitialized.current = true;
      const token = localStorage.getItem("token");
      if (!token) { navigate("/"); return; }
      try {
        const authRes = await fetch("http://localhost:3000/pivoting/auth", {
          method: "POST",
          headers: { Authorization: "Bearer " + token }
        });
        if (authRes.status === 401) { navigate("/"); return; }
        const statusRes = await fetch(`http://localhost:3000/${lab.category}/status`, {
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
  }, [id, navigate]);

  const handleStart = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/${lab.category}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ labId: lab.id })
      });
      const data = await res.json();
      if(res.ok && data.success){
        setIsStarted(true);
        setMachineIp(data.ip)
        alert(data.message)
      } else { alert(data.message || "Failed to start"); }
    } catch (err) { alert("Error connecting to server"); }
    setLoading(false);
  };

  const handleStop = async () => {
    const token = localStorage.getItem("token");
    setStopLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/${lab.category}/stop`, {
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
      const res = await fetch("http://192.168.86.138:3000/flag/verify", {
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
    <div className="lab-detail-container">
      <h1 className="lab-title">{lab.name}</h1>

      <div className="card">
        <h2 className="card-title">Description</h2>
        <p className="card-text">{lab.description}</p>
      </div>

      <div className="card">
        <h3 className="card-title">Lab Machine Control</h3>
        {/* Ye class CSS ke sath aligned hai */}
        <div className="button-group">
          <button className="btn-vpn" onClick={() => navigate("/vpn-downloads")}>
            🛡️ Get VPN
          </button>
          
          {isStarted ? (
            <button className="btn-stop" onClick={handleStop} disabled={stopLoading}>
              {stopLoading ? "Stopping..." : "■ Stop Machine"}
            </button>
          ) : (
            <button className="btn-start" onClick={handleStart} disabled={loading}>
              {loading ? "Starting..." : "▶ Start Machine"}
            </button>
          )}
        </div>
        {isStarted && <p className="ip-display">Machine IP: {machineIp}</p>}
      </div>

      <div className="card">
        <h3 className="card-title">Submit Root Flag</h3>
        <input className="flag-input" value={userFlag} onChange={(e) => setUserFlag(e.target.value)} placeholder={isStarted ? "Enter root flag..." : "Start machine first..."} disabled={!isStarted} />
        <button className="btn-submit" onClick={handleSubmitFlag} disabled={!isStarted}>Submit Flag</button>
        {flagStatus && <p className="flag-status">{flagStatus}</p>}
      </div>
    </div>
  );
}

export default LabDetailPage;