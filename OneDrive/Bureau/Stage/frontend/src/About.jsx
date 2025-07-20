import React from 'react';
import aboutImage from './assets/25b05fb-45be-c556-8043-523efb8ae17_identify-person_1196-x-2100-YanyoGG8basZKBK0.avif';
import './About.css';

const About = () => {
  return (
    <div className="modern-about">
      {/* Hero Section */}
      <section className="modern-hero">
        <div className="hero-content">
          <div className="eyebrow">DEEP-TECH RETAIL SOLUTIONS</div>
          <h1>
            Transforming Retail with <span className="gradient-text">AI Vision</span>
          </h1>
          <p className="hero-description">
            VisShop AI is redefining how physical stores understand shoppers through advanced computer vision and neuromarketing.
          </p>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="capabilities-section">
        <div className="capabilities-container">
          <div className="capabilities-intro">
            <h2>Advanced Retail Intelligence Platform</h2>
            <p>
              We specialize in transforming raw video data into actionable business intelligence — helping retailers reduce losses, improve customer experience, and make smarter decisions in real time.
            </p>
          </div>

          <div className="capabilities-grid">
            <div className="capability-card">
              <div className="card-icon">🛡️</div>
              <h3>Shoplifting Detection</h3>
              <p>Real-time AI surveillance identifying suspicious behaviors with 98% accuracy</p>
            </div>
            <div className="capability-card">
              <div className="card-icon">👥</div>
              <h3>Behavior Analysis</h3>
              <p>Deep learning algorithms decoding customer movement patterns and dwell times</p>
            </div>
            <div className="capability-card">
              <div className="card-icon">📦</div>
              <h3>Stock Optimization</h3>
              <p>Automated inventory tracking and predictive restocking algorithms</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="purpose-section">
        <div className="purpose-container">
          {/* Mission Card */}
          <div className="purpose-card mission-card">
            <div className="card-header">
              <div className="card-icon">🎯</div>
              <h2>Our Mission</h2>
            </div>
            <div className="card-content">
              <p>
                To enable retailers to make <strong>better, faster, and smarter</strong> decisions through real-time, AI-driven insights — 
                improving store performance, enhancing customer satisfaction, and reducing operational losses.
              </p>
              <div className="impact-stats">
                <div className="impact-stat">
                  <div className="stat-value">+35%</div>
                  <div className="stat-label">Operational Efficiency</div>
                </div>
                <div className="impact-stat">
                  <div className="stat-value">-30%</div>
                  <div className="stat-label">Shrinkage Reduction</div>
                </div>
              </div>
            </div>
          </div>

          {/* Vision Card */}
          <div className="purpose-card vision-card">
            <div className="card-header">
              <div className="card-icon">🔭</div>
              <h2>Our Vision</h2>
            </div>
            <div className="card-content">
              <p>
                To become the <strong>leading AI partner</strong> for physical retail worldwide, transforming everyday stores into smart, 
                data-informed environments where both business and customer thrive.
              </p>
              <div className="vision-features">
                <div className="feature">
                  <span>✓</span> Global retail transformation
                </div>
                <div className="feature">
                  <span>✓</span> AI-powered store ecosystems
                </div>
                <div className="feature">
                  <span>✓</span> Win-win retailer/customer value
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-value">100%</div>
            <div className="stat-label">Real-Time Analysis</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">AI</div>
            <div className="stat-label">Powered Technology</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">24/7</div>
            <div className="stat-label">Store Monitoring</div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="section-header">
          <div className="eyebrow">OUR CORE VALUES</div>
          <h2>What Guides Our Work</h2>
        </div>
        
        <div className="values-grid">
          <div className="value-card">
            <h3>Innovation</h3>
            <p>We constantly push boundaries by integrating the latest in AI and computer vision to stay ahead of market trends.</p>
          </div>
          <div className="value-card">
            <h3>Precision</h3>
            <p>Our solutions deliver accurate, behavior-based data that helps retailers act with confidence.</p>
          </div>
          <div className="value-card">
            <h3>Speed & Agility</h3>
            <p>Fast deployment and instant insights — delivering value from day one.</p>
          </div>
          <div className="value-card">
            <h3>Integrity</h3>
            <p>We operate with full transparency and uphold the highest ethical standards in data use.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Transform Your Retail Experience?</h2>
        <p>
          We're always open to collaborating with forward-thinking retailers who believe in the power of AI to revolutionize physical stores.
        </p>
        <button className="cta-button">Get in Touch</button>
      </section>
    </div>
  );
};

export default About;