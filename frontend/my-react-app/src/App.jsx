import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import './App.css';
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
import CtfLabsList from "./page/CtfLabList";
import WebLabList from "./page/WebLabList";
import ProfilePage from "./page/ProfilePage";
import SubscriptionPage from "./page/SubscriptionPage";
import AboutPage from "./page/AboutPage";
import FeedbackPage from "./page/FeedbackPage";
import VpnGuide from "./page/VpnGuide";
import LabIssueForm from "./page/LabIssueForm";

// Ek chhota component banaya jo location check karke Navbar dikhayega ya nahi
function Layout() {
  const location = useLocation();
  
  // Check karo kya current URL me 'labDetailPage' aa raha hai?
  const isLabDetailPage = location.pathname.includes('/labDetailPage');

  return (
    <>
      <SessionTimeout />
      {/* Agar lab detail page nahi hai, tabhi global Navbar dikhao */}
      {!isLabDetailPage && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Login />} />
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
        <Route path="/ctfLabsList" element={<CtfLabsList />} /> 
        <Route path="/webLabList" element={<WebLabList />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/subcriptionpage" element={<SubscriptionPage />} />
        <Route path="/about" element={<AboutPage />} /> 
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/vpn-setup" element={<VpnGuide />} />
        <Route path="/ssueForm" element={<LabIssueForm />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;