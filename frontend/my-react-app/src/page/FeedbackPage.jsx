import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FeedbackPage.css';

function FeedbackPage() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select at least a star rating before submitting!");
      return;
    }
    
    try {
      
        // Jab backend API ready ho jaye, toh is code ko uncomment kar dena:
        const token = localStorage.getItem("token");
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify({ rating, message })
        });

        if (!response.ok) {
          throw new Error("Failed to submit feedback");
        }
      
      // Temporary local console log
      if(response.ok){
        alert("Thank you for your valuable feedback! We truly appreciate your time.");
        navigate("/labs")
      }

    } catch (err) {
      console.error("Error submitting feedback:");
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="feedback-page-wrapper">
      <div className="feedback-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="feedback-header">
          <h2>We Value Your Feedback</h2>
          <p>Share your experience to help us improve the platform.</p>
        </div>

        {submitted ? (
          <div className="success-card">
            <h3>🎉 Thank You!</h3>
            <p>Your feedback has been successfully submitted.</p>
            <button className="btn-submit" onClick={() => navigate('/labs')}>
              Go Back to Labs
            </button>
          </div>
        ) : (
          <form className="feedback-form" onSubmit={handleSubmit}>
            <div className="rating-section">
              <label>Rate your experience:</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= (hover || rating) ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(rating)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="input-section">
              <label htmlFor="message">Your Message / Suggestions:</label>
              <textarea
                id="message"
                rows="5"
                placeholder="Type your message or suggestions here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn-submit">
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default FeedbackPage;