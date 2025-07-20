import React from 'react';
import contactImage from './assets/photo-1470309864661-68328b2cd0a5.avif';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p className="contact-subtitle">
            Reach out to VisShop AI for insights on retail analytics and transforming your shopping experience.
          </p>
        </div>

        <div className="contact-content">
          <div className="contact-image-container">
            <img 
              src={contactImage} 
              alt="Retail analytics visualization" 
              className="contact-image"
            />
          </div>

          <form className="contact-form">
            <div className="form-group">
              <label htmlFor="firstName">Your First Name</label>
              <div className="input-container">
                <input 
                  type="text" 
                  id="firstName" 
                  placeholder="Enter your first name" 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Your Email Address*</label>
              <div className="input-container">
                <input 
                  type="email" 
                  id="email" 
                  placeholder="Enter your email address" 
                  required 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Your Message*</label>
              <div className="input-container">
                <textarea 
                  id="message" 
                  placeholder="Type your message here" 
                  required 
                ></textarea>
              </div>
            </div>
            
            <button type="submit" className="submit-btn">
              Submit Your Inquiry
            </button>
          </form>
        </div>

        {/* Nouvelle section de localisation - ajoutée en dessous du formulaire existant */}
        <div className="location-section">
          <h2>Find Us</h2>
          <div className="map-container">
            <iframe
              title="VisShop AI Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3238.123456789012!2d10.123456789012345!3d35.12345678901234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDA3JzI0LjQiTiAxMMKwMDcnMjQuNCJF!5e0!3m2!1sen!2stn!4v1234567890123!5m2!1sen!2stn"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          
          <div className="location-details">
            <p><strong>Address:</strong> G325-FC6, Rue Zoulia, Mahdia, Tunisia</p>
            <p><strong>Phone:</strong> +216 99 801 260</p>
            <p><strong>Email:</strong> info@visshopai.com</p>
            <p><strong>Hours:</strong> Mon-Fri: 8:30 AM - 5:30 PM | Sat: 9:00 AM - 1:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;