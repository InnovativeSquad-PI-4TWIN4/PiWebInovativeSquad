// Home.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; 
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './home.scss';

const Home = () => {
  const navigate = useNavigate(); 

  const handleClick = () => {
    navigate('/overview'); 
  };

  const features = [
    {
      icon: '📚',
      title: 'Learn New Skills',
      description: 'Join thousands of learners and exchange skills with experts.',
    },
    {
      icon: '🎓',
      title: 'Teach What You Know',
      description: 'Share your expertise and help others grow.',
    },
    {
      icon: '🌐',
      title: 'Build Your Network',
      description: 'Connect with like-minded individuals and grow together.',
    },
  ];

  const testimonials = [
    {
      name: 'John Doe',
      role: 'Web Developer',
      testimonial: 'SkillBridge helped me learn new technologies and connect with amazing people!',
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
      name: 'Jane Smith',
      role: 'UI/UX Designer',
      testimonial: 'I found incredible mentors and expanded my skill set thanks to SkillBridge.',
      image: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
    {
      name: 'Alex Johnson',
      role: 'Data Scientist',
      testimonial: 'The platform is intuitive, and the community is supportive. Highly recommend!',
      image: 'https://randomuser.me/api/portraits/men/3.jpg',
    },
  ];

  const [text, setText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const texts = ['Exchange Skills, Grow Together', 'Build Your Network'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let currentText = texts[currentTextIndex];
    let currentCharIndex = 0;
    let timeout;

    const typeText = () => {
      if (currentCharIndex < currentText.length) {
        setText(currentText.substring(0, currentCharIndex + 1));
        currentCharIndex++;
        timeout = setTimeout(typeText, 120);
      } else {
        timeout = setTimeout(() => {
          setText('');
          setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
        }, 4000);
      }
    };

    typeText();
    return () => clearTimeout(timeout);
  }, [currentTextIndex]);

  return (
    <section className="hero">
      <div className="hero-section">
        <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          {text}<span className="cursor">|</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}>
          Join SkillBridge and unlock your potential by learning, teaching, and connecting.
        </motion.p>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="cta-button" onClick={handleClick}>
          Get Started
        </motion.button>
      </div>

      <div className="features-section">
        <h2>Why Choose SkillBridge?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div key={index} className="feature-card" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.2 }}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="testimonials-section">
        <h2>What Our Users Say</h2>
        <Swiper
          spaceBetween={30}
          slidesPerView={1}
          centeredSlides={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          modules={[Autoplay, Pagination]}
          className="mySwiper"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <div className="testimonial-card">
                <img src={testimonial.image} alt={testimonial.name} />
                <h3>{testimonial.name}</h3>
                <p className="role">{testimonial.role}</p>
                <p>{testimonial.testimonial}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="cta-section">
        <h2>Ready to Join?</h2>
        <p>Enter your email to get started.</p>
        <div className="cta-form">
          <input type="email" placeholder="Enter your email" />
          <button>Join Now</button>
        </div>
      </div>
    </section>
  );
};

export default Home;
