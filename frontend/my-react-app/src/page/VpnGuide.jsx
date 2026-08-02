import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VpnGuide.css';

function VpnGuide() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('linux');
  const [openStep, setOpenStep] = useState(1);

  const toggleStep = (stepNum) => {
    setOpenStep(openStep === stepNum ? null : stepNum);
  };

  // Real file download handler from public folder
  const handleVpnDownload = () => {
    const link = document.createElement('a');
    link.href = '/configs/hacke.ovpn'; // Public folder me jo file rakhega uska naam yahan dena
    link.download = 'hackRangeUsers.ovpn'; // Download hone ke baad file ka naam kya dikhega
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="vpn-page-wrapper">
      <div className="vpn-container">
        
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back to Labs
        </button>

        {/* Header */}
        <div className="vpn-header">
          <h2>🛡️ Setup Guide</h2>
          <p>Follow the instructions below to set up an OpenVPN connection for your operating system.</p>
        </div>

        {/* OS Selector Tabs */}
        <div className="os-tabs">
          <button 
            className={`os-tab ${activeTab === 'windows' ? 'active' : ''}`} 
            onClick={() => setActiveTab('windows')}
          >
            💻 Windows
          </button>
          <button 
            className={`os-tab ${activeTab === 'macos' ? 'active' : ''}`} 
            onClick={() => setActiveTab('macos')}
          >
            🍏 macOS
          </button>
          <button 
            className={`os-tab ${activeTab === 'linux' ? 'active' : ''}`} 
            onClick={() => setActiveTab('linux')}
          >
            🐧 Linux
          </button>
        </div>

        {/* Accordion Steps Container */}
        <div className="steps-accordion">

          {/* Step 1 */}
          <div className={`step-accordion-item ${openStep === 1 ? 'open' : ''}`}>
            <div className="step-accordion-header" onClick={() => toggleStep(1)}>
              <div className="step-title-left">
                <span className="step-badge">1</span>
                <h3>Install OpenVPN Client</h3>
              </div>
              <span className="arrow-icon">{openStep === 1 ? '▲' : '▼'}</span>
            </div>

            {openStep === 1 && (
              <div className="step-accordion-body">
                <p>Download and install the OpenVPN client for your OS.</p>
                
                {activeTab === 'linux' && (
                  <>
                    <p>These steps will work with any Linux distribution using the apt package manager, such as Kali or Ubuntu. For other distributions, swap out the apt package manager for the default one on your system.</p>
                    <p>Before attempting to install OpenVPN, ensure that your packages are fully updated. To do this, run the command:</p>
                    <div className="code-box">sudo apt update && sudo apt upgrade</div>
                    <p className="note-text">⏳ This may take a while, you will have to confirm some updates by inputting "y" or "n" when prompted.</p>
                  </>
                )}

                {activeTab === 'windows' && (
                  <>
                    <p>Download the official <strong>OpenVPN Connect for Windows</strong> installer from the official website or your dashboard.</p>
                    <p>Run the installer, follow the wizard instructions, and ensure the TAP adapter driver is installed when prompted.</p>
                  </>
                )}

                {activeTab === 'macos' && (
                  <>
                    <p>Download <strong>Tunnelblick</strong> or the official OpenVPN Connect client for macOS.</p>
                    <p>Open the downloaded <code>.dmg</code> file and drag the application into your Applications folder.</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div className={`step-accordion-item ${openStep === 2 ? 'open' : ''}`}>
            <div className="step-accordion-header" onClick={() => toggleStep(2)}>
              <div className="step-title-left">
                <span className="step-badge">2</span>
                <h3>Download Configuration File</h3>
              </div>
              <span className="arrow-icon">{openStep === 2 ? '▲' : '▼'}</span>
            </div>

            {openStep === 2 && (
              <div className="step-accordion-body">
                <p>Download your unique <code>.ovpn</code> configuration profile from your lab dashboard.</p>
                <button className="btn-download" onClick={handleVpnDownload}>
                  📥 Download .ovpn Profile
                </button>
              </div>
            )}
          </div>

          {/* Step 3 */}
          <div className={`step-accordion-item ${openStep === 3 ? 'open' : ''}`}>
            <div className="step-accordion-header" onClick={() => toggleStep(3)}>
              <div className="step-title-left">
                <span className="step-badge">3</span>
                <h3>Connect to VPN</h3>
              </div>
              <span className="arrow-icon">{openStep === 3 ? '▲' : '▼'}</span>
            </div>

            {openStep === 3 && (
              <div className="step-accordion-body">
                {activeTab === 'linux' ? (
                  <>
                    <p>Run the following command in your terminal to connect both machines:</p>
                    <div className="code-box">sudo openvpn ~/Downloads/lab-config.ovpn</div>
                    <p className="note-text">⚠️ Watch out, the configuration file name may vary, so make sure your command reflects the actual file name and path.</p>
                  </>
                ) : (
                  <p>Import your downloaded <code>.ovpn</code> file into your OpenVPN client application and click <strong>Connect</strong>.</p>
                )}
              </div>
            )}
          </div>

          {/* Step 4 */}
          <div className={`step-accordion-item ${openStep === 4 ? 'open' : ''}`}>
            <div className="step-accordion-header" onClick={() => toggleStep(4)}>
              <div className="step-title-left">
                <span className="step-badge">4</span>
                <h3>Verify Connection</h3>
              </div>
              <span className="arrow-icon">{openStep === 4 ? '▲' : '▼'}</span>
            </div>

            {openStep === 4 && (
              <div className="step-accordion-body">
                <p>To ensure you have connected successfully, execute this command in your terminal:</p>
                <div className="code-box">ping 192.168.128.1</div>
                <p>You are connected if you can see a response that looks like:</p>
                <div className="code-box-output">PING 192.168.128.1 (192.168.128.1): 56 data bytes</div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default VpnGuide;