import { useEffect } from "react";
import "./Labs.css";
import { useNavigate } from "react-router-dom";

const labs = [
  {
    id: 1,
    title: "Network Tunneling & Pivoting",
    desc: "Learn internal network pivoting practical labs",
    path: "/pivotingLabList",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "CTF Practice",
    desc: "Beginner to advanced capture the flag labs",
    path: "/ctfLabsList",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Web Exploitation",
    desc: "Practice real world web vulnerabilities",
    path: "/WebLabList",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Binary Exploitation",
    desc: "Practice reverse engineering and binary exploitation",
    path: "#",
    comingSoon: true, // Naya flag jo status handle karega
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 6,
    title: "Android Exploitation",
    desc: "Practice Android application security and reverse engineering",
    path: "#",
    comingSoon: true,
    image: "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 8,
    title: "Active Directory (AD)",
    desc: "Practice enterprise network attacks and Kerberoasting",
    path: "#",
    comingSoon: true,
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop",
  },


];

function Labs() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:3000/api/pivoting/auth",
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

  return (
    <div className="labs-page">
      <div className="labs-header">
        <h1>Tracks</h1>
        <p>Accelerate your cybersecurity journey with battle-tested learning paths and guided modules.</p>
      </div>

      <div className="labs-grid">
        {labs.map((lab) => (
          <div className={`lab-card ${lab.comingSoon ? 'disabled-card' : ''}`} key={lab.id}>
            <img src={lab.image} alt={lab.title} />

            <div className="lab-content">
              <h2>{lab.title}</h2>
              <p>{lab.desc}</p>

              {lab.comingSoon ? (
                <button className="btn-coming-soon" disabled>
                  Coming Soon 🚀
                </button>
              ) : (
                <button onClick={() => navigate(lab.path)}>
                  Open Lab
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Labs;