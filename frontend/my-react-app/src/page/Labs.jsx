
import { useEffect } from "react";
import "./Labs.css";
import { useNavigate } from "react-router-dom";

const labs = [
  {
    id: 1,
    title: "Pivoting",
    desc: "Learn internal network pivoting practical labs",
    path: "/pivoting",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 2,
    title: "CTF Practice",
    desc: "Beginner to advanced capture the flag labs",
    path: "/ctf",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 3,
    title: "Active Directory",
    desc: "AD enumeration and exploitation practice",
    path: "/ad-labs",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 4,
    title: "Web Exploitation",
    desc: "Practice real world web vulnerabilities",
    path: "/web-labs",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
  },
];

function Labs() {
  const navigate = useNavigate();
  
  useEffect(() =>{
    const token = localStorage.getItem("token");
    
    if(!token){
      navigate("/");
    }
  });

  return (
    <div className="labs-page">
      <div className="labs-header">
        <h1>Cyber Security Labs</h1>

        <p>Select a lab category and start practicing</p>
      </div>

      <div className="labs-grid">
        {labs.map((lab) => (
          <div className="lab-card" key={lab.id}>
            <img src={lab.image} alt={lab.title} />

            <div className="lab-content">
              <h2>{lab.title}</h2>

              <p>{lab.desc}</p>

              <button onClick={() => navigate(lab.path)}>
                Open Lab
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default Labs;