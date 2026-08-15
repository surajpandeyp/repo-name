import "./WebLabList.css";
import { useNavigate } from 'react-router-dom';
import { allLabs } from './LabData'; 
import { useEffect, useState, useMemo } from "react"; 

function WebLabList() {
  const navigate = useNavigate();
  
  // 1. Sirf 'web' category wale labs filter karo (Optimized with useMemo)
  const WebLabs = useMemo(() => {
    return allLabs.filter(lab => lab.category === 'web');
  }, []);

  const [labsWithLiveData, setLabsWithLiveData] = useState(WebLabs);
  const [loading, setLoading] = useState(true);
  const [runningLabId, setRunningLabId] = useState(null); // Running container tracking state

  // --- SEARCH & FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const labsPerPage = 10; 

  useEffect(() => {
    let isMounted = true; 

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

        // --- STEP B: LIVE DATA FETCH FROM BACKEND ---
        const labIds = WebLabs.map(lab => lab.id);

        const liveRes = await fetch("/api/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ labIds: labIds }) 
        });

        const liveData = await liveRes.json();

        if (liveData.success && isMounted) {
          const mergedData = WebLabs.map(staticLab => {
            const liveInfo = liveData.labs.find(l => l.id === staticLab.id);

            return {
              ...staticLab,
              users: liveInfo ? liveInfo.usersSolvedCount : 0, 
              progress: liveInfo ? liveInfo.progress : "Not Completed" 
            };
          });
          setLabsWithLiveData(mergedData);
        }

        // --- STEP C: FETCH RUNNING CONTAINER STATUS AUTOMATICALLY ---
        const runningRes = await fetch("/api/web/runningContainer", {
          method: "GET",
          headers: { 
            Authorization: "Bearer " + token 
          },
        });
        const runningData = await runningRes.json();
        
        if (runningData.success && runningData.labId && isMounted) {
          setRunningLabId(runningData.labId); 
        }

      } catch (err) {
        console.log("Error fetching live data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuthAndFetchData();

    return () => {
      isMounted = false; 
    };
  }, [navigate, WebLabs]);

  const handleLabClick = (id) => navigate(`/labDetailPage/${id}`);

  // --- SEARCH, DIFFICULTY FILTER & AUTO-SORT LOGIC (Running lab ko top par lane ke liye) ---
  const filteredLabs = useMemo(() => {
    let result = labsWithLiveData.filter(lab => {
      const matchesSearch = lab.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = selectedDifficulty === "All" || lab.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
      return matchesSearch && matchesDifficulty;
    });

    // Agar runningLabId maujood hai, toh us lab ko sabse pehle (Top par) shift kar do
    if (runningLabId !== null) {
      result.sort((a, b) => {
        const isARunning = String(a.id).trim() === String(runningLabId).trim();
        const isBRunning = String(b.id).trim() === String(runningLabId).trim();
        
        if (isARunning) return -1;
        if (isBRunning) return 1;
        return 0;
      });
    }

    return result;
  }, [labsWithLiveData, searchQuery, selectedDifficulty, runningLabId]);

  // --- PAGINATION LOGIC ---
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
      <h1>Web Labs</h1>
     
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
        <div className="column">vip or free</div>
        <div className="column">Difficulty</div>
        <div className="column">OS/Type</div>
        <div className="column">XP</div>
        <div className="column">Users Solved</div>
        <div className="column">Progress</div>
      </div>

      {/* List */}
      {currentLabs.length > 0 ? (
        currentLabs.map((lab) => {
          const isRunning = runningLabId !== null && String(runningLabId).trim() === String(lab.id).trim();

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

export default WebLabList;