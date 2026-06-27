import { useState } from "react";
import { Link } from "react-router-dom";
import "../page/Login.css";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Input change handle
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Form submit handle
  const handleSubmit =  async(e) => {
    e.preventDefault();
    
    
    
    try {
     const res =  await fetch("http://localhost:3000/pivoting/login",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
      },
      body:JSON.stringify(formData)
      })
    // Yaha baad me backend API call karoge
    // fetch("http://localhost:5000/login", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(formData),
    // });
    
      const data = await res.json();

      alert(data.message)

      if(data.success){
        localStorage.setItem("token",data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/labs")
      }

    
      
    }catch (error) {
      console.log(error); 
    }  
  
  };

  return (
    <div className="container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Login</h1>

        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit">Login</button>
        <p className="signup-text">
            Dont have a account? <br />
            <Link to="/register">Sign Up</Link>
        </p>
        
          <p className="forgot-password">
              <Link to="/ForgotPassword">
                Forgot Password?
              </Link>
          </p>


         
      </form>
    </div>
  );
}

export default Login