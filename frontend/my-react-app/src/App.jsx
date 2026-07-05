import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Login from "./page/Login";
import Register from "./page/Register";
import Labs from "./page/Labs";
import Pivoting from "./page/Pivoting";
import Navbar from "./page/Navbar";
import Web from "./page/Web";
import SessionTimeout from "./SessionTimeout";
import ResetPassword from "./page/ResetP";
import ForgotPassword from "./page/ForgotP";
import Subscribe from "./page/Subscribe";
import Ctf from "./page/Ctf";
import TestLogin from "./page/TestLogin";
import PivotingLabList from "./page/PivotingLabList";
import LabDetailPage from "./page/LabDetailPage";

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
         <Route path="/reset-password/:token" element={<ResetPassword />} />
         <Route path="/ForgotPassword" element={<ForgotPassword />} />
         <Route path="/subcribe" element={<Subscribe />} /> 
         <Route path="/ctf" element={<Ctf />} />
         <Route path="/testLogin" element={<TestLogin />} />
         <Route path="/pivotingLabList" element={<PivotingLabList />} />
         <Route path="/labDetailPage/:id" element={<LabDetailPage />} />
       </Routes>
      </BrowserRouter>
       
  )
}

export default App
