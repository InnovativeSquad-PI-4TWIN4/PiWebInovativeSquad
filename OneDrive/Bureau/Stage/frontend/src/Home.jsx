import React from 'react';
import heroImage from './assets/retail-analytics-hero.jpg';
import shopliftingIcon from './assets/shoplifting-icon.png';
import analyticsIcon from './assets/analytics-icon.png';
import stockIcon from './assets/stock-icon.png';
// import demoVideo from './assets/demo-video.mp4';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Transforming In-Store Retail with AI-Powered Behavioral Intelligence</h1>
          <p className="tagline">
            We help traditional retailers detect theft, decode shopper behavior, and optimize shelf performance — all through advanced AI and computer vision.
          </p>
          <div className="cta-buttons">
            <button className="primary-cta">Book a Demo</button>
            <button className="secondary-cta">Try Live Demo</button>
          </div>
        </div>
        <div className="hero-image">
          <img src={heroImage} alt="AI retail analytics in action" />
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <h2>Our Smart AI Solutions</h2>
        <div className="services-grid">
          <div className="service-card">
            <img src={shopliftingIcon} alt="Shoplifting Detection" className="service-icon" />
            <h3>Shoplifting Detection</h3>
            <p>Real-time detection of suspicious behavior using in-store cameras with 98% accuracy.</p>
            <a href="/solutions#shoplifting" className="learn-more">Learn more →</a>
          </div>
          <div className="service-card">
            <img src={analyticsIcon} alt="Retail Analytics" className="service-icon" />
            <h3>Retail Analytics</h3>
            <p>Track customer paths, dwell time and engagement to optimize store layout.</p>
            <a href="/solutions#analytics" className="learn-more">Learn more →</a>
          </div>
          <div className="service-card">
            <img src={stockIcon} alt="Smart Stock AI" className="service-icon" />
            <h3>Smart Stock AI</h3>
            <p>Identify empty shelves in real time and recommend optimal restocking.</p>
            <a href="/solutions#stock" className="learn-more">Learn more →</a>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="demo-section">
        <div className="demo-content">
          <h2>See How It Works</h2>
          <p>Watch our 60-second demo to see VisShop AI in action.</p>
          {/* <div className="video-container">
            <video controls poster="./assets/video-poster.jpg">
              <source src={demoVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div> */}
          <button className="cta-button">Request Free Trial</button>
        </div>
      </section>

      {/* Results Section */}
      <section className="results-section">
        <div className="results-content">
          <h2>Proven Results</h2>
          <div className="result-card">
            <div className="result-value">66%</div>
            <div className="result-description">
              AI analysis showed that moving "Honey Oat Bars" to the "Snacks" section led to a 66% sales increase.
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">+35%</div>
              <div className="stat-label">Operational Efficiency</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">-60%</div>
              <div className="stat-label">Shrinkage Reduction</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">+7%</div>
              <div className="stat-label">Sales Increase</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta">
        <h2>Ready to Transform Your Retail Experience?</h2>
        <p>Get started with VisShop AI today and see results in days.</p>
        <form className="demo-form">
          <input type="text" placeholder="Full Name" required />
          <input type="text" placeholder="Company Name" required />
          <input type="email" placeholder="Work Email" required />
          <input type="tel" placeholder="Phone Number" />
          <button type="submit">Get Started</button>
        </form>
        <div className="privacy-note">
          <span>✓</span> GDPR Compliant • No credit card required • 7-day free trial
        </div>
      </section>
    </div>
  );
};

export default Home;