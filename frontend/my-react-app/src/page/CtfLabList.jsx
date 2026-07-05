import "./CtfLabList.css";
import { useNavigate } from 'react-router-dom';
import { allLabs } from './LabData'; // Yahan se saara data lao
import { useEffect } from "react";

function CtfLabsList() {
  const navigate = useNavigate();

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
  
  // Logic: Sirf 'pivoting' category wale labs filter karo
  const CtfLabs = allLabs.filter(lab => lab.category === 'ctf');

  const handleLabClick = (id) => navigate(`/labDetailPage/${id}`);

  return (
    <div className="labs-container">
      <h1>Pivoting Labs</h1>
      
      {/* Header */}
      <div className="lab-row header-row">
        <div className="column">Name</div>
        <div className="column">Difficulty</div>
        <div className="column">OS/Type</div>
        <div className="column">XP</div>
        <div className="column">Users</div>
        <div className="column">Progress</div>
      </div>

      {/* List - Yahan pivotingLabs ko map karenge */}
      {CtfLabs.map((lab) => (
        <div key={lab.id} className="lab-row" onClick={() => handleLabClick(lab.id)}>
          <div className="column">{lab.name}</div>
          <div className="column">
            <span className="diff-badge">{lab.difficulty}</span>
          </div>
          <div className="column">{lab.os}</div>
          <div className="column">{lab.xp} XP</div>
          <div className="column">{lab.users}</div>
          <div className="column">
            <div className="progress-circle"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CtfLabsList;