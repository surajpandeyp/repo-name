import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Login from "./page/Login";
import Register from "./page/Register";
import Labs from "./page/Labs";
import Pivoting from "./page/Pivoting";
import Navbar from "./page/Navbar";
import Web from "./page/Web";
import SessionTimeout from "./SessionTimeout";

function App() {
  

  return (
    
      <BrowserRouter>
        <SessionTimeout />
        <Navbar />
       <Routes>
         <Route path="/" element ={<Login />} />
         <Route path="/register" element={<Register />} />
         <Route path="/labs" element={<Labs />} />
         <Route path="/pivoting" element={<Pivoting />} />
         <Route path="/web" element={<Web />} />
       </Routes>
      </BrowserRouter>
       
  )
}

export default App
