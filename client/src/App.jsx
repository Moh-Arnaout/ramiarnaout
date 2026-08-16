import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategorySection from './components/CategorySection';
import ProjectGrid from './components/ProjectGrid';
import ProjectDetails from './components/ProjectDetails';
import AdminPanel from './components/AdminPanel';
import About from './components/About';
import { Mail, Phone, MapPin } from 'lucide-react';

// Custom inline SVG icons for social media
const Facebook = ({ size = 24, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = ({ size = 24, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Linkedin = ({ size = 24, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const BACKEND_URL = '';

function normalizeArrayPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'admin'
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [awards, setAwards] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [catsResult, projsResult, awardsResult] = await Promise.allSettled([
        fetch(`${BACKEND_URL}/api/categories`),
        fetch(`${BACKEND_URL}/api/projects`),
        fetch(`${BACKEND_URL}/api/awards`)
      ]);

      const cats = catsResult.status === 'fulfilled' && catsResult.value?.ok
        ? normalizeArrayPayload(await catsResult.value.json().catch(() => []))
        : [];
      const projs = projsResult.status === 'fulfilled' && projsResult.value?.ok
        ? normalizeArrayPayload(await projsResult.value.json().catch(() => []))
        : [];
      const aws = awardsResult.status === 'fulfilled' && awardsResult.value?.ok
        ? normalizeArrayPayload(await awardsResult.value.json().catch(() => []))
        : [];

      setCategories(cats);
      setProjects(projs);
      setAwards(aws);

      if (!cats.length && !projs.length && !aws.length) {
        setErrorMessage('The portfolio content is temporarily unavailable. Please try again shortly.');
      }
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
      setErrorMessage('Unable to load portfolio data right now.');
      setCategories([]);
      setProjects([]);
      setAwards([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReservedAccess = () => {
    setCurrentView('admin');
  };

  const handleLockDashboard = () => {
    setAdminUnlocked(false);
    setCurrentView('home');
  };

  // Category Actions
  const handleAddCategory = async (formData) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/categories`, {
        method: 'POST',
        body: formData // Multipar/form-data
      });
      if (res.ok) {
        const newCat = await res.json();
        setCategories(prev => [...(Array.isArray(prev) ? prev : []), newCat]);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error('Network error creating category:', err);
    }
  };

  const handleUpdateCategory = async (catId, formData) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/categories/${catId}`, {
        method: 'PUT',
        body: formData
      });
      if (res.ok) {
        const updatedCat = await res.json();
        setCategories(prev => (prev?.map ? prev.map(c => c.id === catId ? updatedCat : c) : []));
        alert('Category updated successfully!');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error('Network error updating category:', err);
    }
  };

  const handleDeleteCategory = async (catId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/categories/${catId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCategories(prev => (Array.isArray(prev) ? prev.filter(c => c.id !== catId) : []));
        // Refresh projects since their category link might have updated
        fetchData();
      } else {
        alert('Failed to delete category');
      }
    } catch (err) {
      console.error('Network error deleting category:', err);
    }
  };

  // Project Actions
  const handleAddProject = async (formData) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const newProj = await res.json();
        setProjects(prev => [...(Array.isArray(prev) ? prev : []), newProj]);
        alert('Project published successfully!');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error('Network error adding project:', err);
    }
  };

  const handleUpdateProject = async (projId, formData) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects/${projId}`, {
        method: 'PUT',
        body: formData
      });
      if (res.ok) {
        const updated = await res.json();
        setProjects(prev => (prev?.map ? prev.map(p => p.id === projId ? updated : p) : []));
        alert('Project updated successfully!');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error('Network error updating project:', err);
    }
  };

  const handleDeleteProject = async (projId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects/${projId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProjects(prev => (Array.isArray(prev) ? prev.filter(p => p.id !== projId) : []));
      } else {
        alert('Failed to delete project');
      }
    } catch (err) {
      console.error('Network error deleting project:', err);
    }
  };

  // Award Actions
  const handleAddAward = async (formData) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/awards`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const newAward = await res.json();
        setAwards(prev => [...(Array.isArray(prev) ? prev : []), newAward]);
        alert('Award added successfully!');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error('Network error adding award:', err);
    }
  };

  const handleUpdateAward = async (awardId, formData) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/awards/${awardId}`, {
        method: 'PUT',
        body: formData
      });
      if (res.ok) {
        const updated = await res.json();
        setAwards(prev => (prev?.map ? prev.map(a => a.id === awardId ? updated : a) : []));
        alert('Award updated successfully!');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error('Network error updating award:', err);
    }
  };

  const handleDeleteAward = async (awardId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/awards/${awardId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAwards(prev => (Array.isArray(prev) ? prev.filter(a => a.id !== awardId) : []));
      } else {
        alert('Failed to delete award');
      }
    } catch (err) {
      console.error('Network error deleting award:', err);
    }
  };

  return (
    <div>
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onReservedAccess={handleReservedAccess}
        backendUrl={BACKEND_URL}
      />

      {errorMessage && (
        <div style={{ margin: '1rem auto 0', maxWidth: '960px', padding: '0.9rem 1rem', borderRadius: '8px', background: 'rgba(255, 92, 92, 0.12)', color: 'var(--text-primary)', border: '1px solid rgba(255, 92, 92, 0.3)' }}>
          {errorMessage}
        </div>
      )}

      {isLoading && currentView === 'home' && (
        <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Loading portfolio...
        </div>
      )}

      {currentView === 'home' && (
        <div className="page-transition" key="home">
          <Hero
            onExploreClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
          />

          <CategorySection
            categories={categories}
            projects={projects}
            activeCategory={activeCategory}
            onCategorySelect={setActiveCategory}
            backendUrl={BACKEND_URL}
          />

          <ProjectGrid
            projects={projects}
            categories={categories}
            activeCategory={activeCategory}
            onCategorySelect={setActiveCategory}
            onProjectClick={(proj) => {
              setSelectedProject(proj);
              setCurrentView('project-details');
            }}
            backendUrl={BACKEND_URL}
          />
        </div>
      )}

      {currentView === 'admin' && (
        <div className="page-transition" key="admin">
          <AdminPanel
            initialAuthenticated={adminUnlocked}
            onLockDashboard={handleLockDashboard}
            onUnlockDashboard={() => setAdminUnlocked(true)}
            projects={projects}
            categories={categories}
            awards={awards}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onAddAward={handleAddAward}
            onUpdateAward={handleUpdateAward}
            onDeleteAward={handleDeleteAward}
            backendUrl={BACKEND_URL}
          />
        </div>
      )}

      {currentView === 'project-details' && selectedProject && (
        <div className="page-transition" key={`project-${selectedProject.id}`}>
          <ProjectDetails
            project={selectedProject}
            categories={categories}
            onClose={() => {
              setCurrentView('home');
              setSelectedProject(null);
              setTimeout(() => {
                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            backendUrl={BACKEND_URL}
          />
        </div>
      )}

      {currentView === 'about' && (
        <div className="page-transition" key="about">
          <About onViewChange={setCurrentView} awards={awards} backendUrl={BACKEND_URL} />
        </div>
      )}

      {/* Footer / Contact Section - hide on project details and about pages */}
      {currentView !== 'project-details' && currentView !== 'about' && (
        <footer id="contact" className="footer">
          <div className="container footer-grid">
            <div className="footer-brand">
              <h4>Rami Arnaout</h4>
              <p>
                Premium architecture consulting engineering based in Amman, Jordan.
                Delivering high-end structural design, detailed blueprints, and construction
                supervision services across residential, religious, and public sectors.
              </p>
              <img
                src={`${BACKEND_URL}/uploads/logo.png`}
                alt="Logo"
                className="footer-logo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            </div>

            <div className="footer-links">
              <h5>Navigation</h5>
              <ul className="footer-links-list">
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentView('home');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentView('home');
                      setTimeout(() => {
                        document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
                      }, 50);
                    }}
                  >
                    Categories
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentView('home');
                      setTimeout(() => {
                        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                      }, 50);
                    }}
                  >
                    Projects
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentView('about');
                    }}
                  >
                    About the Architect
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-contact">
              <h5>Contact Details</h5>
              <div className="footer-contact-details">
                <div className="contact-item">
                  <MapPin className="contact-item-icon" size={18} />
                  <div className="contact-item-text">
                    Fifth Circle,<br />Amman, Jordan
                  </div>
                </div>

                <div className="contact-item">
                  <Mail className="contact-item-icon" size={18} />
                  <div className="contact-item-text">
                    <a href="mailto:ramiarnaout@yahoo.com">ramiarnaout@yahoo.com</a>
                  </div>
                </div>

                <div className="contact-item">
                  <Phone className="contact-item-icon" size={18} />
                  <div className="contact-item-text">
                    <a href="tel:0795637851">0795637851</a> (Jordan)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container footer-bottom">
            <div className="copyright">
              &copy; {new Date().getFullYear()} Rami Arnaout Architects. All Rights <button type="button" className="footer-secret-link" onClick={handleReservedAccess}>Reserved</button>.
            </div>
            <div className="social-links">
              <a
                href="https://www.facebook.com/p/Rami-Arnaout-Architects-100082949493878/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                title="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://www.instagram.com/ramiarnaoutarchitects/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                title="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.linkedin.com/in/rami-arnaout-4033bb28/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
