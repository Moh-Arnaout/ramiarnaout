import React from 'react';
import { ArrowDown } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  return (
    <section className="hero">
      <div className="hero-bg-image"></div>
      <div className="hero-bg-overlay"></div>
      <div className="hero-background-swirl"></div>
      <div className="container">
        <div className="hero-content">
          <div className="hero-subtitle">Consulting Engineers</div>
          <h1 className="hero-title">
            Crafting Spaces 
            <span>With Structural Arches</span>
          </h1>
          <p className="hero-description">
            Rami Arnaout Architects is an architectural engineering consultancy based in Amman, Jordan. 
            We specialize in creating premium residences, modern commercial complexes, and serene public venues 
            defined by sweeping structural arches, clean limestone facades, and state-of-the-art biological shapes.
          </p>
          <div className="hero-cta">
            <button className="btn-primary" onClick={onExploreClick}>
              Explore Work
              <ArrowDown size={16} />
            </button>
            <button 
              className="btn-secondary"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get In Touch
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
