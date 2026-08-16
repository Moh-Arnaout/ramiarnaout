import React, { useEffect, useRef } from 'react';

export default function CategorySection({ categories, projects, onCategorySelect, activeCategory, backendUrl }) {
  const sectionRef = useRef(null);
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
      { threshold: 0.1 }
    );

    const childElements = sectionRef.current?.querySelectorAll('.reveal-in') || [];
    childElements.forEach((el) => observer.observe(el));

    return () => {
      childElements.forEach((el) => observer.unobserve(el));
    };
  }, [categories]);

  // Helper to count projects per category
  const getProjectCount = (categoryId) => {
    return safeProjects.filter(p => p.category === categoryId).length;
  };

  return (
    <section id="categories" className="container" ref={sectionRef} style={{ paddingBottom: '4rem' }}>
      <div className="section-title-wrap reveal-in">
        <span className="section-subtitle">Core Expertise</span>
        <h2 className="section-title">Design Sectors</h2>
      </div>

      <div className="categories-container">
        {safeCategories?.map((cat, idx) => {
          const count = getProjectCount(cat.id);
          const isSelected = activeCategory === cat.id;
          
          return (
            <div 
              key={cat.id} 
              className="category-card reveal-in"
              style={{ 
                transitionDelay: `${idx * 150}ms`,
                borderColor: isSelected ? 'var(--accent-orange)' : 'var(--border-glass)',
                boxShadow: isSelected ? '0 16px 32px rgba(0,0,0,0.4), 0 0 16px rgba(224, 83, 32, 0.15)' : ''
              }}
              onClick={() => {
                onCategorySelect(cat.id);
                // Smooth scroll to projects section
                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <div className="category-arch">
                <img 
                  src={cat.image?.startsWith('http') || cat.image?.startsWith('/uploads') ? `${backendUrl}${cat.image}` : cat.image} 
                  alt={cat.name} 
                  className="category-img"
                  style={{ objectPosition: cat.imagePosition || '50% 50%' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `${backendUrl}/uploads/logo.png`;
                  }}
                />
              </div>
              <div className="category-info">
                <h3 className="category-name">{cat.name}</h3>
                <span className="category-count">{count} {count === 1 ? 'Project' : 'Projects'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
