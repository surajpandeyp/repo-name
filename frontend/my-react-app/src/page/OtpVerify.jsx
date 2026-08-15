import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../page/OtpVerify.css"; // Nayi CSS file import kar li

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otp) {
      alert("Please enter the OTP");
      return;
    }

    try {
      const res = await fetch("/api/pivoting/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        navigate("/");
      } else {
        alert(data.message || "OTP verification failed");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="otp-page-wrapper">
      <div className="otp-card">
        <h2>Enter Verification Code</h2>
        <p className="otp-subtitle">
          Please enter the 6-digit code sent to <br />
          <span className="otp-email">{email || "your registered email"}</span>
        </p>

        <form onSubmit={handleVerify}>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Enter 6-digit OTP" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              maxLength="6"
              required 
            />
          </div>

          <button type="submit" className="verify-btn">Verify OTP</button>
        </form>
      </div>
    </div>
  );
}


export default VerifyOTP;