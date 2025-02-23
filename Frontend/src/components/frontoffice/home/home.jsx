import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './home.scss';

const Home = () => {
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
      testimonial: 'SkillSwap helped me learn new technologies and connect with amazing people!',
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
      name: 'Jane Smith',
      role: 'UI/UX Designer',
      testimonial: 'I found incredible mentors and expanded my skill set thanks to SkillSwap.',
      image: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
    {
      name: 'Alex Johnson',
      role: 'Data Scientist',
      testimonial: 'The platform is intuitive, and the community is supportive. Highly recommend!',
      image: 'https://randomuser.me/api/portraits/men/3.jpg',
    },
  ];

  return (
    <section className="hero">
      {/* Hero Section */}
      <div className="hero-section">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Exchange Skills, Grow Together
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Join SkillBridge and unlock your potential by learning, teaching, and connecting.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="cta-button"
        >
          Get Started
        </motion.button>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Why Choose SkillBridge?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="testimonials-section">
        <h2>What Our Users Say</h2>
        <Swiper
          spaceBetween={30}
          slidesPerView={1} // Show one testimonial at a time
          centeredSlides={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          modules={[Autoplay, Pagination]}
          className="mySwiper"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <div className="testimonial-card">
                <img src={testimonial.image} alt={testimonial.name} />
                <h3>{testimonial.name}</h3>
                <p>{testimonial.role}</p>
                <p>{testimonial.testimonial}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Call-to-Action Section */}
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