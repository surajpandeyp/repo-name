import "./ResetP.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ResetPassword() {

  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [cpassword, setCpassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Verify Token
  const verifyToken = async () => {

    try {

      const res = await fetch(
        `http://localhost:3000/reset-password/verify-token/${token}`
      );

      const data = await res.json();

      if (data.success) {
        setValidToken(true);
      }

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    verifyToken();

  }, [token]);

  // Reset Password
  const resetPassword = async () => {

    setMessage("");

    if (!password || !cpassword) {

      return setMessage(
        "Please fill all fields"
      );
    }

    if (password !== cpassword) {

      return setMessage(
        "Passwords do not match"
      );
    }

    try {

      const res = await fetch(
        "http://localhost:3000/reset-password/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await res.json();

      setMessage(data.message);

      if (data.success) {

        setSuccess(true);

        setPassword("");
        setCpassword("");

        setTimeout(() => {

          navigate("/");

        }, 3000);
      }

    } catch (err) {

      console.log(err);

      setMessage(
        "Server Error"
      );
    }
  };

  // Loading Screen
  if (loading) {

    return (
      <div className="reset-page">
        <div className="reset-card">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  // Invalid Token
  if (!validToken) {

    return (
      <div className="reset-page">
        <div className="reset-card">

          <h2>
            Invalid Or Expired Link
          </h2>

          <p>
            This password reset link is no longer valid.
          </p>

        </div>
      </div>
    );
  }

  // Main Page
  return (

    <div className="reset-page">

      <div className="reset-card">

        <h1>
          Reset Password
        </h1>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={cpassword}
          onChange={(e) =>
            setCpassword(e.target.value)
          }
        />

        <button
          onClick={resetPassword}
        >
          Reset Password
        </button>

        {message && (
          <p
            className={
              success
                ? "success-msg"
                : "error-msg"
            }
          >
            {message}
          </p>
        )}

      </div>

    </div>
  );
}

export default ResetPassword;