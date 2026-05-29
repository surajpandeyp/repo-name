// src/pages/Pivoting.jsx

import "./Pivoting.css";
import { useState } from "react";
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
    title: "Pivoting Lab 1",
    difficulty: "Easy",
    desc: "Basic pivoting using SSH tunneling and internal network enumeration.",
    time: "30 - 45 min",
    level: "Beginner Friendly",

    // BACKEND CONTAINERS
    containers: [
      "internal",
      "pivot"
    ]
  },

  {
    id: 2,
    title: "Pivoting Lab 2",
    difficulty: "Medium",
    desc: "Advanced port forwarding and proxy pivoting techniques.",
    time: "45 - 60 min",
    level: "Intermediate",

    containers: [
      "web",
      "db",
      "pivot2"
    ]
  },

  {
    id: 3,
    title: "Pivoting Lab 3",
    difficulty: "Hard",
    desc: "Multi-hop pivoting and internal network exploitation.",
    time: "60 - 90 min",
    level: "Advanced",

    containers: [
      "ad",
      "internal2",
      "pivot3"
    ]
  },

  {
    id: 4,
    title: "Pivoting Lab 4",
    difficulty: "Insane",
    desc: "Complex pivoting across multiple networks and domain environments.",
    time: "90+ min",
    level: "Expert",

    containers: [
      "dc01",
      "web01",
      "pivot4"
    ]
  },
];

function Pivoting() {

  const [startedLabs, setStartedLabs] = useState({});
  const [loadingLabs, setLoadingLabs] = useState({});

  // START LAB
  const startLab = async (lab) => {

    // LOADING ON
    setLoadingLabs((prev) => ({
      ...prev,
      [lab.id]: true,
    }));

    try {

      // API CALL
      const res = await fetch(
        "http://localhost:3000/docker/start",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            // CONTAINER NAMES
            containers: lab.containers

          }),
        }
      );

      const data = await res.json();

      // SAVE IP
      setStartedLabs((prev) => ({
        ...prev,
        [lab.id]: data.ip,
      }));

    } catch (err) {

      console.log(err);

      alert("Failed To Start Lab");

    }

    // LOADING OFF
    setLoadingLabs((prev) => ({
      ...prev,
      [lab.id]: false,
    }));

  };

  // STOP LAB
  const stopLab = async (lab) => {

    try {

      await fetch(
        "http://localhost:3000/docker/stop",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            containers: lab.containers

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

  // COPY IP
  const copyIP = (ip) => {

    navigator.clipboard.writeText(ip);

    alert("IP Copied: " + ip);

  };

  return (

    <div className="pivot-page">

      <div className="pivot-header">
        <h1>Pivoting Labs</h1>

        <p>
          Practice internal network pivoting
          with real-world scenarios
        </p>
      </div>

      <div className="pivot-grid">

        {pivotLabs.map((lab) => (

          <div className="pivot-card" key={lab.id}>

            {/* LEFT */}
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

              </div>

            </div>

            {/* RIGHT */}
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
                      copyIP(startedLabs[lab.id])
                    }
                  />

                )}

              </div>

              {/* BUTTONS */}
              <div className="btn-row">

                {!startedLabs[lab.id] ? (

                  <button
                    className="start-btn"
                    onClick={() => startLab(lab)}
                    disabled={loadingLabs[lab.id]}
                  >

                    {loadingLabs[lab.id]
                      ? "Starting..."
                      : (
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

export default Pivoting;