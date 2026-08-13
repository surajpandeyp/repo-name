import "./CtfLabList.css";
import { useNavigate } from 'react-router-dom';
import { allLabs } from './LabData'; // Saara static data yahan se aaya
import { useEffect, useState, useMemo } from "react"; 

function CtfLabsList() {
  const navigate = useNavigate();
  
  // 1. Logic: Sirf 'ctf' category wale labs filter karo (Optimized with useMemo)
  const CtfLabs = useMemo(() => {
    return allLabs.filter(lab => lab.category === 'ctf');
  }, []);

  const [labsWithLiveData, setLabsWithLiveData] = useState(CtfLabs);
  const [loading, setLoading] = useState(true);
  const [runningLabId, setRunningLabId] = useState(null); // Running container tracking state

  // --- SEARCH & FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const labsPerPage = 10; // Ek page par 10 labs dikhengi

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // --- STEP A: AUTH CHECK ---
        const authRes = await fetch(
          "/api/pivoting/auth",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        if (authRes.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
          return;
        }

        // --- STEP B: LIVE DATA & PROGRESS FETCH FROM BACKEND ---
        const labIds = CtfLabs.map(lab => lab.id);

        const liveRes = await fetch("/api/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ labIds: labIds }) 
        });

        const liveData = await liveRes.json();

        let mergedData = CtfLabs;
        if (liveData.success) {
          mergedData = CtfLabs.map(staticLab => {
            const liveInfo = liveData.labs.find(l => l.id === staticLab.id);

            return {
              ...staticLab,
              users: liveInfo ? liveInfo.usersSolvedCount : 0, 
              progress: liveInfo ? liveInfo.progress : "Not Completed" 
            };
          });
          setLabsWithLiveData(mergedData);
        }

        // --- STEP C: FETCH RUNNING CONTAINER STATUS ---
        const runningRes = await fetch("/api/runningContainer", {
          headers: { 
            Authorization: "Bearer " + token 
          },
        });
        const runningData = await runningRes.json();
        
        if (runningData.success && runningData.labId) {
          setRunningLabId(Number(runningData.labId));
        }

        setLoading(false);

      } catch (err) {
        console.log("Error fetching live data:", err);
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [navigate, CtfLabs]);

  const handleLabClick = (id) => navigate(`/labDetailPage/${id}`);

  // --- SEARCH & DIFFICULTY FILTER LOGIC ---
  const filteredLabs = useMemo(() => {
    return labsWithLiveData.filter(lab => {
      const matchesSearch = lab.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = selectedDifficulty === "All" || lab.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
      return matchesSearch && matchesDifficulty;
    });
  }, [labsWithLiveData, searchQuery, selectedDifficulty]);

  // --- PAGINATION LOGIC (Based on filteredLabs) ---
  const indexOfLastLab = currentPage * labsPerPage;
  const indexOfFirstLab = indexOfLastLab - labsPerPage;
  const currentLabs = filteredLabs.slice(indexOfFirstLab, indexOfLastLab);

  const totalPages = Math.ceil(filteredLabs.length / labsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDifficultyChange = (e) => {
    setSelectedDifficulty(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return <div className="labs-container"><h3>Loading...</h3></div>;
  }

  return (
    <div className="labs-container">
      <h1>Ctf Labs</h1>
     
      {/* --- SEARCH & DIFFICULTY FILTER UI --- */}
      <div className="filter-bar">
        <div className="search-box-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search labs..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <select 
          className="difficulty-select" 
          value={selectedDifficulty} 
          onChange={handleDifficultyChange}
        >
          <option value="All">Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
          <option value="Insane">Insane</option>
        </select>
      </div>

      {/* Header */}
      <div className="lab-row header-row">
        <div className="column">Name</div>
        <div className="column">VIP or Free</div>
        <div className="column">Difficulty</div>
        <div className="column">OS/Type</div>
        <div className="column">XP</div>
        <div className="column">Users Solved</div>
        <div className="column">Progress</div>
      </div>

      {/* List - Ab yahan filtered aur current page ki labs dikhengi */}
      {currentLabs.length > 0 ? (
        currentLabs.map((lab) => {
          const isRunning = runningLabId === lab.id;

          return (
            <div 
              key={lab.id} 
              className={`lab-row ${isRunning ? 'running-row-highlight' : ''}`} 
              onClick={() => handleLabClick(lab.id)}
            >
              <div className="column" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {lab.name}
                {isRunning && (
                  <span className="running-badge">RUNNING</span>
                )}
              </div>
              <div className="column">{lab.premium}</div>
              <div className="column">
                <span className="diff-badge">{lab.difficulty}</span>
              </div>
              <div className="column">{lab.os}</div>
              <div className="column">{lab.xp} XP</div>
              <div className="column">{lab.users} Users</div>
              <div className="column">
                {lab.progress === "Completed" ? (
                  <div className="progress-circle completed" style={{ backgroundColor: "#2ecc71" }} title="Completed"></div>
                ) : (
                  <div className="progress-circle" title="Not Completed" style={{ border: "2px solid #95a5a6", backgroundColor: "transparent" }}></div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
          No labs found matching your filter.
        </div>
      )}

      {/* --- PAGINATION NUMBERS UI --- */}
      {totalPages > 1 && (
        <div className="pagination" style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  backgroundColor: currentPage === pageNumber ? "#2563eb" : "#1e293b",
                  color: "white",
                  border: "1px solid #334155",
                  borderRadius: "6px",
                  fontWeight: currentPage === pageNumber ? "bold" : "normal"
                }}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CtfLabsList;