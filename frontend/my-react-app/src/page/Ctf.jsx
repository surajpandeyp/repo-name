import "./Ctf.css";
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

function Ctf() {
  const navigate = useNavigate();

  // ==========================================
  // COMPONENT STATES
  // ==========================================
  const [startedLabs, setStartedLabs] = useState({});
  const [loadingLabs, setLoadingLabs] = useState({});
  const [userFlags, setUserFlags] = useState({});
  const [flagStatus, setFlagStatus] = useState({});
  const [isAnyLabRunning, setIsAnyLabRunning] = useState(false);

  // ==========================================
  // LIFECYCLE: FETCH ACTIVE LAB STATUS
  // ==========================================
  useEffect(() => {
    const fetchLabStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:3000/test/status", {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        const data = await res.json();

        if (data.success && data.running) {
          const runningLabId = Number(data.labId);
          setStartedLabs({
            [runningLabId]: data.ip,
          });
          setIsAnyLabRunning(true);
        } else {
          setStartedLabs({});
          setIsAnyLabRunning(false);
        }
      } catch (err) {
        console.log("Error fetching status:", err);
      }
    };

    fetchLabStatus();
  }, []);

  // ==========================================
  // LIFECYCLE: SESSION SECURITY & AUTH CHECK
  // ==========================================
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:3000/pivoting/auth",
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

  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  const handleUserFlagChange = (labId, value) => {
    setUserFlags((prev) => ({
      ...prev,
      [labId]: value,
    }));
  };

  // ==========================================
  // ACTION: SUBMIT FLAG VERIFICATION
  // ==========================================
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

  // ==========================================
  // ACTION: START TARGET LAB CONTEXT
  // ==========================================
  const startLab = async (lab) => {
    const token = localStorage.getItem("token");
    
    // GUARD CLAUSE: Block execution if another container instance is currently active
    if (isAnyLabRunning) {
      const runningLabId = Object.keys(startedLabs)[0];
      
      if (runningLabId && Number(runningLabId) !== Number(lab.id)) {
        alert(`Lab ${runningLabId} is already running! You cannot start multiple labs simultaneously. Please stop the active lab first.`);
      } else {
        alert("This specific lab is already running!");
      }
      return; 
    }

    setLoadingLabs((prev) => ({
      ...prev,
      [lab.id]: true,
    }));

    try {
      const res = await fetch(
        "http://localhost:3000/test/start/",
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

      const data = await res.json();
      
      if (res.status === 403) {
        alert("Subscription Required");
        navigate("/subcribe");
        return;
      }

      if (!res.ok) {
        alert(data.message || "Failed To Start Lab");
        return;
      }

      const currentLabId = Number(lab.id);
      setStartedLabs((prev) => ({
        ...prev,
        [currentLabId]: data.ip,
      }));
      setIsAnyLabRunning(true);

    } catch (err) {
      console.log(err);
      alert("Failed To Start Lab");
    } finally {
      setLoadingLabs((prev) => ({
        ...prev,
        [lab.id]: false,
      }));
    }
  };

  // ==========================================
  // ACTION: STOP RUNNING LAB CONTEXT
  // ==========================================
  const stopLab = async (lab) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        "http://localhost:3000/test/stop/",
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

      if (res.ok) {
        setStartedLabs((prev) => {
          const updated = { ...prev };
          delete updated[Number(lab.id)]; 
          return updated;
        });
        setIsAnyLabRunning(false); 
      } else {
        alert("Failed To Stop Lab");
      }
    } catch (err) {
      console.log(err);
      alert("Failed To Stop Lab");
    }
  };

  // ==========================================
  // UTILITY: UTILS FOR CLIPBOARD COPY
  // ==========================================
  const copyIP = (ip) => {
    navigator.clipboard.writeText(ip);
    alert("IP Address Copied: " + ip);
  };

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

                <div className={`difficulty ${lab.difficulty.toLowerCase()}`}>
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
                      handleUserFlagChange(lab.id, e.target.value)
                    }
                  />

                  <button
                    className="submit-flag-btn"
                    onClick={() => submitUserFlag(lab)}
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
                    onClick={() => copyIP(startedLabs[lab.id])}
                  />
                )}
              </div>

              <div className="btn-row">
                {!startedLabs[lab.id] ? (
                  <button
                    className="start-btn"
                    onClick={() => startLab(lab)}
                    disabled={loadingLabs[lab.id]} // Keeps trigger functional to capture alert logic
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
                    onClick={() => stopLab(lab)}
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

export default Ctf;