
import './TestLogin.css';


function TestLogin () {
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Sign In</h2>
        
        <div className="input-group">
          <label>Username or email*</label>
          <input type="text" className="error-input" placeholder="Enter your username" />
          <p className="error-text">Enter your username or email</p>
        </div>

        <div className="input-group">
          <label>Password*</label>
          <input type="password" placeholder="Enter your password" />
        </div>

        <button className="signin-btn">Sign In</button>

        <div className="footer-links">
          <a href="/forgot-password">Forgot password?</a>
          <p style={{ marginTop: '20px', color: '#666' }}>
            Don't have an account? <a href="/register" style={{ display: 'inline', marginLeft: '5px' }}>Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestLogin;