import "./Forgot.css";
import { useState } from "react";

function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendResetLink = async () => {

    if (!email) {
      return setMessage("Enter Email Address");
    }

    setLoading(true);
    setMessage("");

    try {

      const res = await fetch(
        "http://localhost:3000/reset-password/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email
          })
        }
      );

      const data = await res.json();

      setMessage(data.message);

    } catch (err) {

      console.log(err);

      setMessage("Server Error");

    }

    setLoading(false);
  };

  return (

    <div className="forgot-page">

      <div className="forgot-card">

        <h1>Forgot Password</h1>

        <p>
          Enter your email address and we'll send you a password reset link.
        </p>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <button
          onClick={sendResetLink}
          disabled={loading}
        >
          {loading
            ? "Sending..."
            : "Send Reset Link"}
        </button>

        {message && (
          <p className="msg">
            {message}
          </p>
        )}

      </div>

    </div>
  );
}

export default ForgotPassword;