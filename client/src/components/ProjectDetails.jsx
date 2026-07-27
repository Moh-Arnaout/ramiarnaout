import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, Layers, ZoomIn, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function ProjectDetails({ project, categories, onClose, backendUrl }) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Reset image index when project changes
  useEffect(() => {
    setActiveImageIdx(0);
    // Scroll page to top when mounting details
    window.scrollTo(0, 0);
  }, [project]);

  if (!project) return null;

  const images = project.images && project.images.length > 0 ? project.images : [project.mainImage];
  const catName = categories.find(c => c.id === project.category)?.name || 'General';

  const isVideo = (idx) => {
    if (project.imageResourceTypes && project.imageResourceTypes[idx]) {
      return project.imageResourceTypes[idx] === 'video';
    }
    const url = images[idx] || '';
    return url.includes('/video/upload/') || /\.(mp4|mov|webm|ogv)($|\?)/i.test(url);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const getFullImageUrl = (path) => {
    if (path.startsWith('http') || path.startsWith('/uploads')) {
      return `${backendUrl}${path}`;
    }
    return path;
  };

  return (
    <div className="container project-details-page">
      <div className="project-details-header">
        <div className="project-details-title-area">
          <div className="project-details-breadcrumbs">
            <a href="#" onClick={(e) => { e.preventDefault(); onClose(); }}>Portfolio</a>
            <span>/</span>
            <span>{project.title}</span>
          </div>
          <h1>{project.title}</h1>
        </div>
        <button className="btn-back" onClick={onClose}>
          <ArrowLeft size={16} />
          Back to Projects
        </button>
      </div>

      <div className="project-details-grid">
        {/* Left Column: Gallery */}
        <div className="project-details-gallery">
          <div className="modal-gallery-container" style={{ borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            {isVideo(activeImageIdx) ? (
              <video
                src={getFullImageUrl(images[activeImageIdx])}
                className="modal-active-image"
                controls
                autoPlay
                muted
                playsInline
                style={{ objectFit: 'contain', width: '100%', height: '100%', maxHeight: '60vh', background: '#000' }}
              />
            ) : (
              <img 
                src={getFullImageUrl(images[activeImageIdx])} 
                alt={`${project.title} - view ${activeImageIdx + 1}`} 
                className="modal-active-image"
                style={{ objectPosition: (project.imagePositions && project.imagePositions[activeImageIdx]) || '50% 50%' }}
                onClick={() => setLightboxOpen(true)}
                title="Click to Zoom In"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `${backendUrl}/uploads/logo.png`;
                }}
              />
            )}

            {images.length > 1 && (
              <>
                <button className="modal-gallery-nav modal-gallery-prev" onClick={handlePrevImage}>
                  <ChevronLeft size={24} />
                </button>
                <button className="modal-gallery-nav modal-gallery-next" onClick={handleNextImage}>
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <div 
              style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                background: 'rgba(0,0,0,0.6)',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                pointerEvents: 'none'
              }}
            >
              <ZoomIn size={14} />
              <span>Click to zoom</span>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="modal-thumbnails" style={{ borderRadius: '12px', marginTop: '1rem', border: '1px solid var(--border-glass)' }}>
              {images.map((img, idx) => {
                const video = isVideo(idx);
                return video ? (
                  <div
                    key={idx}
                    className={`thumbnail-item ${idx === activeImageIdx ? 'active' : ''}`}
                    onClick={() => setActiveImageIdx(idx)}
                    style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', overflow: 'hidden', padding: 0 }}
                  >
                    <video
                      src={getFullImageUrl(img)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      preload="metadata"
                    />
                    <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                      <span style={{ borderStyle: 'solid', borderWidth: '4px 0 4px 6px', borderColor: 'transparent transparent transparent #fff', display: 'inline-block', marginLeft: '1px' }}></span>
                    </div>
                  </div>
                ) : (
                  <img
                    key={idx}
                    src={getFullImageUrl(img)}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`thumbnail-item ${idx === activeImageIdx ? 'active' : ''}`}
                    style={{ objectPosition: (project.imagePositions && project.imagePositions[idx]) || '50% 50%' }}
                    onClick={() => setActiveImageIdx(idx)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `${backendUrl}/uploads/logo.png`;
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Narrative and Specs */}
        <div className="project-details-sidebar">
          {/* Metadata Card */}
          <div className="details-meta-card">
            <h3>Project Details</h3>
            <div className="details-meta-list">
              <div className="details-meta-row">
                <span className="details-meta-label">
                  <Layers size={15} />
                  Category
                </span>
                <span className="details-meta-value">{catName}</span>
              </div>
              <div className="details-meta-row">
                <span className="details-meta-label">
                  <Calendar size={15} />
                  Date Made
                </span>
                <span className="details-meta-value">{project.date}</span>
              </div>
              <div className="details-meta-row">
                <span className="details-meta-label">
                  <MapPin size={15} />
                  Location
                </span>
                <span className="details-meta-value">{project.location}</span>
              </div>
            </div>
          </div>

          {/* Narrative description */}
          {project.description && (
            <div className="details-narrative-card">
              <h3>Narrative</h3>
              <p className="details-narrative-text">{project.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Zoom View */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>
            <X size={24} />
          </button>
          {isVideo(activeImageIdx) ? (
            <video
              src={getFullImageUrl(images[activeImageIdx])}
              className="lightbox-image"
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: '90vh', maxWidth: '90vw' }}
            />
          ) : (
            <img 
              src={getFullImageUrl(images[activeImageIdx])} 
              alt={project.title} 
              className="lightbox-image"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
}
