import React, { useEffect, useRef } from 'react';
import { Eye, MapPin } from 'lucide-react';

export default function ProjectGrid({ 
  projects, 
  categories, 
  activeCategory, 
  onCategorySelect, 
  onProjectClick, 
  backendUrl 
}) {
  const gridRef = useRef(null);
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeProjects = Array.isArray(projects) ? projects : [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.05 }
    );

    const childElements = gridRef.current?.querySelectorAll('.reveal-in') || [];
    childElements.forEach((el) => observer.observe(el));

    return () => {
      childElements.forEach((el) => observer.unobserve(el));
    };
  }, [projects, activeCategory]);

  const filteredProjects = activeCategory === 'all' 
    ? safeProjects 
    : safeProjects.filter(p => p.category === activeCategory);

  return (
    <section id="projects" className="container" ref={gridRef} style={{ paddingTop: '4rem' }}>
      <div className="section-title-wrap reveal-in">
        <span className="section-subtitle">Exquisite Creations</span>
        <h2 className="section-title">Portfolio Showcase</h2>
      </div>

      {/* Filter Buttons */}
      <div className="portfolio-filters reveal-in">
        <button 
          className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => onCategorySelect('all')}
        >
          All Projects
        </button>
        {safeCategories?.map((cat) => (
          <button 
            key={cat.id} 
            className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => onCategorySelect(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredProjects.length === 0 ? (
        <div className="reveal-in" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <p>No projects found in this category.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((proj, idx) => {
            const catName = safeCategories.find(c => c.id === proj.category)?.name || 'General';
            
            return (
              <div 
                key={proj.id} 
                className="project-card reveal-in"
                style={{ transitionDelay: `${(idx % 3) * 150}ms` }}
                onClick={() => onProjectClick(proj)}
              >
                <div className="project-image-wrap">
                  {(() => {
                    const mainImg = proj.mainImage?.startsWith('http') || proj.mainImage?.startsWith('/uploads') ? `${backendUrl}${proj.mainImage}` : proj.mainImage;
                    const isVid = proj.mainImageResourceType === 'video' || mainImg.includes('/video/upload/') || /\.(mp4|mov|webm|ogv)($|\?)/i.test(mainImg);
                    return isVid ? (
                      <video
                        src={mainImg}
                        className="project-image"
                        muted
                        loop
                        playsInline
                        autoPlay
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    ) : (
                      <img 
                        src={mainImg} 
                        alt={proj.title} 
                        className="project-image"
                        style={{ objectPosition: (Array.isArray(proj.imagePositions) && proj.imagePositions[0]) || '50% 50%' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `${backendUrl}/uploads/logo.png`;
                        }}
                      />
                    );
                  })()}
                  <div className="project-overlay">
                    <div className="project-view-btn">
                      <Eye size={20} />
                    </div>
                  </div>
                </div>
                
                <div className="project-details">
                  <div className="project-meta">
                    <span>{catName}</span>
                    <span>{proj.date}</span>
                  </div>
                  <h3 className="project-card-title">{proj.title}</h3>
                  <div className="project-card-location" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} className="contact-item-icon" />
                    <span>{proj.location}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
