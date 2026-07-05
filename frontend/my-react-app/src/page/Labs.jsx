import { useEffect } from "react";
import "./Labs.css";
import { useNavigate } from "react-router-dom";

const labs = [
  {
    id: 1,
    title: "Pivoting",
    desc: "Learn internal network pivoting practical labs",
    path: "/pivotingLabList",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 2,
    title: "CTF Practice",
    desc: "Beginner to advanced capture the flag labs",
    path: "/ctf",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
  },


  {
    id: 4,
    title: "Web Exploitation",
    desc: "Practice real world web vulnerabilities",
    path: "/web",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
  },
];

function Labs() {
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
              <h2 >{lab.title}</h2>

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