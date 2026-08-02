import React, { useEffect, useState } from 'react';
import './SubscriptionPage.css';
import { useNavigate } from 'react-router-dom';

function SubscriptionPage() {
  const [subData, setSubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/my-subscription", {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        const data = await res.json();
        setSubData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching subscription status:", err);
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <div className="sub-container">
        <h3 className="sub-loading">Checking your membership status...</h3>
      </div>
    );
  }

  return (
    <div className="sub-container">
      <div className="sub-header">
        <h1>Labs Account</h1>
        <p>Manage your billing, plans, and premium laboratory access.</p>
      </div>

      {subData && subData.subscribed ? (
        /* Render active plan view for subscribed users */
        <div className="sub-card active-card">
          <div className="active-badge">ACTIVE PLAN</div>
          <h2>VIP Premium Lab Access</h2>
          
          <div className="sub-details">
            <div className="detail-row">
              <span className="detail-label">Current Plan:</span>
              <span className="detail-value plan-highlight">{subData.plan.toUpperCase()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Started On:</span>
              <span className="detail-value">
                {new Date(subData.startDate).toLocaleDateString('en-US', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Next Billing Date:</span>
              <span className="detail-value expiry-highlight">
                {new Date(subData.expiryDate).toLocaleDateString('en-US', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
            </div>
          </div>
          
          <div className="sub-footer-text">
            ✓ Your VIP subscription is active. You have full access to all Pivoting & Web Labs!
          </div>
        </div>
      ) : (
        /* Render pricing tiers for non-subscribed users */
        <div className="pricing-section">
          <div className="not-sub-alert">
            <p>You are currently on the <strong>Free Plan</strong>. Upgrade to unlock all premium lab content.</p>
          </div>
          
          <div className="pricing-grid">
            {/* VIP Monthly Plan Options */}
            <div className="pricing-card highlighted">
              <div className="pricing-badge">MOST POPULAR</div>
              <h3>VIP Monthly</h3>
              <div className="price">₹200<span>/month</span></div>
              <ul className="pricing-features">
                <li>✓ Full access to all Labs</li>
                <li>✓ 24/7 Dedicated Web CTF Instances</li>
                <li>✓ Discord VIP Community Role</li>
              </ul>
              <button className="upgrade-btn"
               onClick={() => navigate('/subcribe')}
              >Subscribe Now</button>
            </div>
            
            {/* 
              React JSX Comment: 
              This section for VIP Yearly Plan is currently commented out 
              as per your requirements but kept in the source code.
              
              <div className="pricing-card">
                <h3>VIP Annual</h3>
                <div className="price">$120<span>/year</span></div>
                <ul className="pricing-features">
                  <li>✓ All Monthly VIP benefits</li>
                  <li>✓ Save $60 annually</li>
                  <li>✓ Downloadable PDF Lab Walkthroughs</li>
                  <li>✓ Certificate of Completion</li>
                </ul>
                <button className="upgrade-btn secondary">Go Annual</button>
              </div>
            */}
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionPage;