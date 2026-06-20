import { useState } from "react";
import { Link } from "react-router-dom";
import "../page/Register.css"
import { useNavigate } from "react-router-dom";


function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    cpassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(formData);

    if (formData.password !== formData.cpassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/docker/register",{
        method:"POST",
        headers:{
           "Content-Type":"application/json",
        },
        body:JSON.stringify(formData)
      })

      const data = await res.json()

      if(res.ok){
        alert(data.message);
        navigate("/")
        return;
      }
    } catch (error) {
      console.log(error);
      
      
    }

      

    

    // Yaha baad me backend API call kar sakte ho
  };

  return (
    <div className="container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Register</h1>

        <input
          type="text"
          name="username"
          placeholder="Enter username"
          value={formData.username}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
        />

        <input
          type="password"
          name="cpassword"
          placeholder="cpassword"
          value={formData.cpassword}
          onChange={handleChange}
        />

        <button type="submit">Register</button>

        <p className="signup-text">
          Already have an account?
          <Link to="/"> Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;