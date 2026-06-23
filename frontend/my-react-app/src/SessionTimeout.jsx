import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SessionTimeout() {
  const navigate = useNavigate();

  useEffect(() => {
    const events = ["mousemove", "click", "keydown", "scroll"];

    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        alert("Session Expired");

        navigate("/");
      }, 60 * 60 * 1000); // 1 hour
    };

    events.forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer();

    return () => {
      clearTimeout(timeout);

      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [navigate]);

  return null;
}

export default SessionTimeout;