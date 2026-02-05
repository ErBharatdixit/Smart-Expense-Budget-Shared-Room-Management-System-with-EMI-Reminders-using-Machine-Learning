import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
      return (
            <div className="min-h-screen bg-[#0B1120] text-white selection:bg-blue-500/30">
                  <Navbar />
                  <main>
                        <Hero />
                        <Features />
                  </main>
                  <Footer />
            </div>
      );
};

export default LandingPage;
