import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { allLabs } from './LabData';
import './LabDetailPage.css';

function LabDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lab = allLabs.find((l) => String(l.id) === String(id));
  
  

  // States
  const [isStarted, setIsStarted] = useState(false);
  const [machineIp, setMachineIp] = useState("");
  const [userFlag, setUserFlag] = useState("");
  const [flagStatus, setFlagStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Auth & Status Check
 const isInitialized = useRef(false); // Ref banaya

useEffect(() => {
  // Agar pehle chal chuka hai, toh dobara mat chalao
  if (isInitialized.current) return;

  const init = async () => {
    isInitialized.current = true; // Mark as initialized
    
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    try {
      // 1. Subscription Check
      

      // 2. Auth Check
      const authRes = await fetch("http://localhost:3000/pivoting/auth", {
        method: "POST",
        headers: { Authorization: "Bearer " + token }
      });
      
      if (authRes.status === 401) { 
        navigate("/"); 
        return; 
      }

      // 3. Status Check
      const statusRes = await fetch("http://localhost:3000/test/status", {
        headers: { Authorization: "Bearer " + token }
      });
      const statusData = await statusRes.json();
      
      if (statusData.success && statusData.running && String(statusData.labId) === String(id)) {
        setIsStarted(true);
        setMachineIp(statusData.ip);
      }
    } catch (err) { 
      console.error("Init Error:", err); 
    }
  };

  init();

  // Component unmount hone par cleanup (optional)
  return () => { isInitialized.current = false; };
}, [id, navigate]);
  // 2. Start Lab
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
      if (res.ok) {
        setIsStarted(true);
        setMachineIp(data.ip);
      } else {
        alert(data.message || "Failed to start");
      }
    } catch (err) { alert("Error connecting to server"); }
    setLoading(false);
  };

  // 3. Stop Lab
  const handleStop = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3000/${lab.category}/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ labId: lab.id })
      });
      if (res.ok) {
        setIsStarted(false);
        setMachineIp("");
      } else {
        alert("Failed to stop");
      }
    } catch (err) { alert("Error connecting to server"); }
  };

  // 4. Submit Flag
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
        <div className="card-header">
          <h3>Lab Machine Control</h3>
          {isStarted ? (
            <button className="btn-stop" onClick={handleStop}>■ Stop Machine</button>
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
        <input 
          className="flag-input" 
          value={userFlag}
          onChange={(e) => setUserFlag(e.target.value)}
          placeholder={isStarted ? "Enter root flag..." : "Start machine first..."}
          disabled={!isStarted} 
        />
        <button className="btn-submit" onClick={handleSubmitFlag} disabled={!isStarted}>Submit Flag</button>
        {flagStatus && <p style={{marginTop: '10px', fontSize: '0.9rem', color: '#333'}}>{flagStatus}</p>}
      </div>
    </div>
  );
}

export default LabDetailPage;