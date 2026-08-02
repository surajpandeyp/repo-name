import React from 'react';
import './LabIssueForm.css';

const LabIssueForm = () => {
  // Yahan apni official business mail ID daal de bhai
  const supportEmail = "support@yourctflabs.com";
  
  // Mail click hone par subject aur body automatically pre-fill ho jayegi
  const mailSubject = encodeURIComponent("Issue Regarding CTF / Web Lab");
  const mailBody = encodeURIComponent("Hello Team,\n\nI am facing an issue with one of the labs:\n\n[Describe your issue here]");

  return (
    <div className="support-container">
      <div className="support-card">
        <h2 className="support-title">Lab Support & Assistance</h2>
        
        <p className="support-desc">
          Facing any technical errors, container issues, or flag discrepancies regarding our labs? 
          Don't worry! Reach out to us directly via email, and our business support team will resolve it quickly.
        </p>

        <div className="email-pill">
          📧 {supportEmail}
        </div>

        <a 
          href={`mailto:${supportEmail}?subject=${mailSubject}&body=${mailBody}`} 
          className="direct-mail-btn"
        >
          Send Email to Support
        </a>
      </div>
    </div>
  );
};

export default LabIssueForm;