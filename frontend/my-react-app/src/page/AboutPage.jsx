import React from 'react';
import { Link } from 'react-router-dom';
import './AboutPage.css';

function AboutPage() {
  return (
    <div className="about-wrapper">
      <div className="about-container">
        
        {/* Hero Section */}
        <section className="about-hero">
          <h1>🎯 About Hacking Labs</h1>
          <p className="hero-tagline">
            The ultimate training ground for cyber security professionals, penetration testers, and CTF enthusiasts.
          </p>
        </section>

        {/* Core Mission Section */}
        <section className="about-mission-section">
          <h2>🛡️ Our Mission</h2>
          <p>
            We provide realistic, hands-on environments designed to bridge the gap between theoretical knowledge and practical execution. Here, players can simulate cyber attacks inside real-world enterprise networks, bypass defense mechanisms, and build industry-grade offensive security skills.
          </p>
        </section>

        {/* Platform Categories Grid */}
        <section className="about-features-section">
          <h2>💻 What We Offer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>🌐 Web Exploitation</h3>
              <p>Discover, analyze, and exploit vulnerabilities like SQLi, XSS, SSRF, and logical bypasses in modern web applications.</p>
            </div>
            <div className="feature-card">
              <h3>⚙️ Pivoting & Tunneling</h3>
              <p>Learn how to route traffic, tunnel protocols, and pivot deep through internal network layers to reach isolated machines.</p>
            </div>
            <div className="feature-card">
              <h3>📁 Active Directory (AD)</h3>
              <p>Infiltrate realistic Windows Domain environments, abuse kerberos protocols, exploit trusts, and achieve Domain Admin privileges.</p>
            </div>
            <div className="feature-card">
              <h3>⚡ Binary Exploitation</h3>
              <p>Analyze pre-compiled binaries, bypass memory protections, hijack execution flows, and execute custom shellcodes.</p>
            </div>
            <div className="feature-card">
              <h3>⚡ Ctf</h3>
              <p>Test your offensive security skills against realistic, hands-on CTF challenges.</p>
            </div>
          </div>
        </section>

        {/* VPN Connection Quick Guide */}
        <section className="about-vpn-section">
          <h2>🔌 How to Connect & Start Practicing</h2>
          <p className="vpn-intro">To access our isolated target machines and network segments, you must connect via our secure VPN.</p>
          
          <div className="vpn-steps">
            <div className="vpn-step">
              <span className="step-number">1</span>
              <div>
                <h4>Go to VPN Page</h4>
                <p>Click on the **VPN** option in the main navigation bar at the top of the page.</p>
              </div>
            </div>

            <div className="vpn-step">
              <span className="step-number">2</span>
              <div>
                <h4>Download Configuration</h4>
                <p>Click on the **Generate & Download** button to receive your unique `.ovpn` configuration file.</p>
              </div>
            </div>

            <div className="vpn-step">
              <span className="step-number">3</span>
              <div>
                <h4>Connect to Network</h4>
                <p>Import your file into OpenVPN. Run `sudo openvpn profile.ovpn` in your terminal to establish the connection.</p>
              </div>
            </div>
          </div>

          <div className="vpn-action">
            <Link to="/vpn">
              <button className="vpn-redirect-btn">⚡ Get Connection Details</button>
            </Link>
          </div>
        </section>

      </div>

      {/* Professional Footer with Creator Name */}
      <footer className="platform-footer">
        <div className="footer-content">
          <div className="footer-left">
            <h3>🛡️ Hacking Labs</h3>
            <p>Designed to replicate realistic corporate infrastructures for training teams and individuals in offensive cyber operations.</p>
          </div>
          <div className="footer-right">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/labs">All Labs</Link></li>
              <li><Link to="/vpn">VPN</Link></li>
              <li><Link to="/subscription">Subscription</Link></li>
            </ul>
          </div>
        </div>
        <hr className="footer-divider" />
        <div className="footer-bottom">
          <p className="copyright">&copy; {new Date().getFullYear()} Hacking Labs. All Rights Reserved.</p>
          <p className="creator-tag">Designed & Built by 🧑‍💻 <span className="creator-name">Suraj Pandey</span></p>
        </div>
      </footer>
    </div>
  );
}

export default AboutPage;