import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function VerifyOTP() {
    const [otp, setOtp] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    
    // Registration page se email pass karke yahan la sakte hain
    const email = location.state?.email || ''; 

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/pivoting/verify-otp', {
                email,
                otp
            });
            alert(response.data.message);
            navigate('/login'); // Verify hone ke baad login page par bhej do
        } catch (error) {
            alert(error.response?.data?.message || "Verification failed");
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Enter OTP Verification Code</h2>
            <p>OTP sent to: <b>{email}</b></p>
            <form onSubmit={handleVerify}>
                <input 
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    maxLength="6"
                    required 
                />
                <button type="submit">Verify OTP</button>
            </form>
        </div>
    );
}

export default VerifyOTP;