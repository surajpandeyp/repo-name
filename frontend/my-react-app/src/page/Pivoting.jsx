import "./Web.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Play,
  Copy,
  Monitor,
  Clock3,
  User,
  Square,
} from "lucide-react";

const pivotLabs = [
  {
    id: 1,
    title: "Lab 1",
    difficulty: "Easy",
    desc: "epic_grothendieck",
    time: "30 - 45 min",
    isfree: true,
    level: "Beginner Friendly",
    containers: ["epic_grothendieck"],
  },
  {
    id: 2,
    title: "Pivoting Lab 2",
    difficulty: "Medium",
    desc: "Advanced port forwarding and proxy pivoting techniques.",
    time: "45 - 60 min",
    isfree: false,
    level: "Intermediate",
    containers: ["web", "db", "pivot2"],
  },
  {
    id: 3,
    title: "Pivoting Lab 3",
    difficulty: "Hard",
    desc: "Multi-hop pivoting and internal network exploitation.",
    time: "60 - 90 min",
    isfree: false,
    level: "Advanced",
    containers: ["ad", "internal2", "pivot3"],
  },
  {
    id: 4,
    title: "Pivoting Lab 4",
    difficulty: "Insane",
    desc: "Complex pivoting across multiple networks and domain environments.",
    time: "90+ min",
    isfree: false,
    level: "Expert",
    containers: ["dc01", "web01", "pivot4"],
  },
];

function Pivoting() {
  const navigate = useNavigate();

  // ======================
  // STATES
  // ======================

  const [startedLabs, setStartedLabs] = useState({});
  const [loadingLabs, setLoadingLabs] = useState({});

  const [userFlags, setUserFlags] = useState({});
  const [flagStatus, setFlagStatus] = useState({});

  // ======================
  // AUTH CHECK
  // ======================

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:3000/docker/auth",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
        }
      } catch (err) {
        console.log(err);
      }
    };

    checkAuth();
  }, [navigate]);

  // ======================
  // FLAG INPUT
  // ======================

  const handleUserFlagChange = (labId, value) => {
    setUserFlags((prev) => ({
      ...prev,
      [labId]: value,
    }));
  };

  // ======================
  // SUBMIT FLAG
  // ======================

  const submitUserFlag = async (lab) => {
    const token = localStorage.getItem("token");

    try {
      setFlagStatus((prev) => ({
        ...prev,
        [lab.id]: "Loading...",
      }));

      const res = await fetch(
        "http://192.168.86.138:3000/flag/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            labId: lab.id,
            userFlag: userFlags[lab.id] || "",
          }),
        }
      );

      const data = await res.json();

      setFlagStatus((prev) => ({
        ...prev,
        [lab.id]: data.message,
      }));
    } catch (err) {
      console.log(err);

      setFlagStatus((prev) => ({
        ...prev,
        [lab.id]: "Error submitting flag",
      }));
    }
  };

  // ======================
  // START LAB
  // ======================
  
  const startLab = async (lab) => {
    const token = localStorage.getItem("token");
    
    setLoadingLabs((prev) => ({
      ...prev,
      [lab.id]: true,
    }));

    try {
      const res = await fetch(
        "http://localhost:3000/docker/start/pivoting/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            labId:lab.id
          }),
        }
      );

      const data = await res.json();
      
      if(res.status === 403){
        alert("Subscription Required")
        navigate("/")
        return;
      }
      setStartedLabs((prev) => ({
        ...prev,
        [lab.id]: data.ip,
      }));
    } catch (err) {
      console.log(err);
      alert("Failed To Start Lab");
    }

    setLoadingLabs((prev) => ({
      ...prev,
      [lab.id]: false,
    }));
  };

  // ======================
  // STOP LAB
  // ======================

  const stopLab = async (lab) => {
    const token = localStorage.getItem("token");

    try {
      await fetch(
        "http://localhost:3000/docker/stop/pivoting/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            labId: lab.id
          }),
        }
      );

      setStartedLabs((prev) => {
        const updated = { ...prev };
        delete updated[lab.id];
        return updated;
      });
    } catch (err) {
      console.log(err);
      alert("Failed To Stop Lab");
    }
  };

  // ======================
  // COPY IP
  // ======================

  const copyIP = (ip) => {
    navigator.clipboard.writeText(ip);
    alert("IP Copied: " + ip);
  };

  // ======================
  // JSX
  // ======================

  return (
    <div className="pivot-page">
      <div className="pivot-header">
        <h1>Pivoting Labs</h1>
        <p>Web site testing</p>
      </div>

      <div className="pivot-grid">
        {pivotLabs.map((lab) => (
          <div className="pivot-card" key={lab.id}>
            <div className="pivot-left">
              <div className="lab-icon">
                <Monitor size={40} />
              </div>

              <div className="lab-info">
                <div className="lab-top">
                  <span className="lab-number">
                    0{lab.id}
                  </span>

                  <h2>{lab.title}</h2>

                  {lab.isfree && (
                    <span className="free-badge">
                      FREE
                    </span>
                  )}
                </div>

                <div
                  className={`difficulty ${lab.difficulty.toLowerCase()}`}
                >
                  ● {lab.difficulty}
                </div>

                <p>{lab.desc}</p>

                <div className="lab-meta">
                  <span>
                    <Clock3 size={15} />
                    {lab.time}
                  </span>

                  <span>
                    <User size={15} />
                    {lab.level}
                  </span>
                </div>

                <div className="flag-box">
                  <input
                    type="text"
                    placeholder="User Flag"
                    value={userFlags[lab.id] || ""}
                    onChange={(e) =>
                      handleUserFlagChange(
                        lab.id,
                        e.target.value
                      )
                    }
                  />

                  <button
                    className="submit-flag-btn"
                    onClick={() =>
                      submitUserFlag(lab)
                    }
                  >
                    Submit User Flag
                  </button>

                  {flagStatus[lab.id] && (
                    <p className="flag-status">
                      {flagStatus[lab.id]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pivot-right">
              <p className="ip-label">
                Lab IP Address
              </p>

              <div className="ip-box">
                <span>
                  {startedLabs[lab.id]
                    ? startedLabs[lab.id]
                    : loadingLabs[lab.id]
                    ? "Starting..."
                    : "Not Started"}
                </span>

                {startedLabs[lab.id] && (
                  <Copy
                    size={20}
                    className="copy-icon"
                    onClick={() =>
                      copyIP(
                        startedLabs[lab.id]
                      )
                    }
                  />
                )}
              </div>

              <div className="btn-row">
                {!startedLabs[lab.id] ? (
                  <button
                    className="start-btn"
                    onClick={() =>
                      startLab(lab)
                    }
                    disabled={
                      loadingLabs[lab.id]
                    }
                  >
                    {loadingLabs[lab.id] ? (
                      "Starting..."
                    ) : (
                      <>
                        <Play size={18} />
                        Start Lab
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    className="stop-btn"
                    onClick={() =>
                      stopLab(lab)
                    }
                  >
                    <Square size={18} />
                    Stop Lab
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pivoting;