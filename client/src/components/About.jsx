import React, { useState, useEffect, useRef } from 'react';
import { formatImageUrl } from '../utils/imageUtils';
import ramiPhoto from '../assets/rami_arnaout2.jpeg';
import {
  Mail, Phone, MapPin, Award, BookOpen, Briefcase,
  ChevronUp, ExternalLink, GraduationCap, Building2,
  Globe, Star, Trophy, Users
} from 'lucide-react';

/* ─────────────────────────── DATA ─────────────────────────── */

const STATS = [
  { value: '30+', label: 'Years of Experience', icon: Briefcase },
  { value: '80+', label: 'Delivered Projects', icon: Building2 },
  { value: '20+', label: 'Architectural Awards', icon: Trophy },
  { value: '8', label: 'Arab Countries', icon: Globe },
];

const PROCESS_STEPS = [
  {
    id: 1,
    num: '01',
    title: 'Conceptual Sketching',
    subtitle: 'Translating Context to Paper',
    desc: 'Translating cultural context and spatial geometry into raw freehand concept sketches.',
    sketchLabel: 'Raw Hand Sketch',
    // We will place a CSS grid design/blueprint placeholder, or default background
    imgUrl: '/uploads/process_sketch.jpg',
  },
  {
    id: 2,
    num: '02',
    title: '3D Spatial Modeling',
    subtitle: 'Proportions & Grids',
    desc: 'Refining proportions, structural grids, and light interaction through 3D wireframes and digital massing.',
    sketchLabel: '3D Model Render',
    imgUrl: '/uploads/process_model.jpg',
  },
  {
    id: 3,
    num: '03',
    title: 'Materialization & Execution',
    subtitle: 'Reality & Craftsmanship',
    desc: 'Realizing the final built architecture with precise structural engineering and regional craftsmanship.',
    sketchLabel: 'Built Reality',
    imgUrl: '/uploads/process_built.jpg',
  },
];

const EDUCATION = [
  { year: '1996', degree: 'M.Sc. in Architecture', school: 'University of Jordan, Amman', note: null },
  { year: '1993', degree: 'B.Sc. in Architecture', school: 'University of Jordan, Amman', note: '1st Rank Honors' },
];

const ACADEMIC_ROLES = [
  { period: '2022 – Present', role: 'Fellow, School of Built Environment', inst: 'Hussein Technical University (HTU), Jordan' },
  { period: '2020 – 2021', role: 'External Design Studio Instructor', inst: 'American University of Madaba (AUM)' },
  { period: '2010 – 2013', role: 'External Design Studio Instructor', inst: 'Jordan University of Science & Technology (JUST)' },
];

const CAREER = [
  {
    period: '2010 – Present',
    role: 'Founder & Lead Architectural Consultant',
    org: 'Rami Arnaout Architects',
    type: 'founder',
  },
  {
    period: '1993 – 2009',
    role: 'Associate · Senior Architect · Lead Designer',
    org: 'DAR AL-OMRAN',
    type: 'associate',
  },
];

// Awards are fully managed via the Admin Panel (no hardcoded fallbacks).

const PORTFOLIO_TABS = [
  {
    id: 'civic',
    label: 'Civic & Museums',
    icon: Building2,
    items: [
      'Bader Battle Museum (8,000 m²)',
      'Al Khandaq Museum (10,000 m²)',
      'Palm Museum Mecca (30,000 m²)',
      'Al-Muraba Museum / Dar Al-Malik Abdul Aziz',
    ],
  },
  {
    id: 'commercial',
    label: 'Commercial & HQ',
    icon: Briefcase,
    items: [
      'Schlumberger HQ (Jubail)',
      'SabTank Office Building',
      'Sladin Office Building',
      'Karawan Business Park',
    ],
  },
  {
    id: 'masterplan',
    label: 'Urban Masterplans',
    icon: Globe,
    items: [
      'Godolphin River City (1.2M m², Dubai)',
      'Heart of Doha (25,000 m²)',
      'Darb Almasha\'er (1.2M m², Mecca)',
      'Wadi Amman Urban Development',
    ],
  },
  {
    id: 'sacred',
    label: 'Sacred Architecture',
    icon: Star,
    items: [
      'Qatar State Mosque',
      'Al-Rihan Mosque',
      'Abu Gazaleh Mosque',
      'Al-Zaher Mosque (Mecca)',
      'Al Musheref Friday Mosque (Riyadh)',
    ],
  },
  {
    id: 'hospitality',
    label: 'Hospitality & Mixed-Use',
    icon: Users,
    items: [
      'Al Tayseer Hotel (230,000 m², Mecca)',
      'Park Inn Hotel (120,000 m², Mecca)',
      'Taif Resort Complex',
      'Al-Coot & Al-Mansher Malls (Kuwait)',
    ],
  },
];

const PUBLICATIONS = [
  { title: 'The Role of Regional Approaches in Expressing Identity in Contemporary Arab Architecture (1970–1995)', type: 'M.Sc. Thesis' },
  { title: 'Astronomical Center in Amman', type: 'Graduation Project Thesis — 1st Rank' },
  { title: 'Architectural Changes in Rural Settlements in Northern Jordan', type: 'Research Paper' },
  { title: 'Restoration & Rehabilitation of Historical Sites Workshop', type: 'Workshop Proceedings — Rome & Marrakech' },
];

/* ─────────────────────────── HELPERS ─────────────────────────── */

function useScrollAnimation() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function AnimatedSection({ children, className = '' }) {
  const [ref, visible] = useScrollAnimation();
  return (
    <div ref={ref} className={`about-animated-section ${visible ? 'is-visible' : ''} ${className}`}>
      {children}
    </div>
  );
}

/* ─────────────────────────── SUB-COMPONENTS ─────────────────────────── */

function SectionLabel({ text }) {
  return (
    <div className="about-section-label">
      <span className="about-section-label__line" />
      <span className="about-section-label__text">{text}</span>
    </div>
  );
}

function StatBadge({ value, label, Icon }) {
  return (
    <div className="about-stat-badge">
      <Icon size={20} className="about-stat-badge__icon" />
      <span className="about-stat-badge__value">{value}</span>
      <span className="about-stat-badge__label">{label}</span>
    </div>
  );
}

function ProcessShowcase() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="about-process-split">
      <div className="about-process-left">
        {PROCESS_STEPS.map((step, idx) => (
          <div
            key={step.id}
            className={`about-process-step-card ${activeStep === idx ? 'about-process-step-card--active' : ''}`}
            onClick={() => setActiveStep(idx)}
            onMouseEnter={() => setActiveStep(idx)}
          >
            <div className="about-process-step-num">
              <span className="about-process-step-num__text">{step.num} //</span>
            </div>
            <div className="about-process-step-content">
              <h4 className="about-process-step-title">{step.title}</h4>
              <p className="about-process-step-desc">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="about-process-right">
        <div className="about-process-preview-frame">
          <div className="about-process-grid-overlay" />

          <div className="about-process-image-container">
            {PROCESS_STEPS.map((step, idx) => (
              <div
                key={step.id}
                className={`about-process-image-wrapper ${activeStep === idx ? 'about-process-image-wrapper--active' : ''}`}
              >
                <div className="about-process-fallback-art">
                  <div className="about-process-fallback-lines" />
                  <span className="about-process-fallback-badge">{step.sketchLabel}</span>
                  <span className="about-process-fallback-meta">{step.subtitle}</span>
                </div>
                {/* Image element with error handling for when USER uploads them */}
                <img
                  src={step.imgUrl}
                  alt={step.title}
                  className="about-process-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>

          <div className="about-process-toggle-bar">
            {PROCESS_STEPS.map((step, idx) => (
              <button
                key={step.id}
                className={`about-process-toggle-btn ${activeStep === idx ? 'about-process-toggle-btn--active' : ''}`}
                onClick={() => setActiveStep(idx)}
              >
                {step.id === 1 ? 'Sketch' : step.id === 2 ? '3D Model' : 'Built Reality'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AwardCard({ item, backendUrl }) {
  const { year, project, location, award, office, image } = item;
  const yearNum = parseInt(year);

  // Determine office display based on year and database values
  const officeDisplay = office ? office : (yearNum < 2010 ? 'DAR AL-OMRAN' : 'Rami Arnaout Architects');

  // Determine award tier styling
  const lowerAward = award.toLowerCase();
  let tierClass = 'about-award-tier--other';
  if (lowerAward.includes('1st')) {
    tierClass = 'about-award-tier--gold';
  } else if (lowerAward.includes('2nd')) {
    tierClass = 'about-award-tier--silver';
  } else if (lowerAward.includes('3rd')) {
    tierClass = 'about-award-tier--bronze';
  }

  // Construct absolute image source
  const imageSrc = image ? formatImageUrl(image, backendUrl) : null;

  return (
    <div className={`about-award-card ${tierClass}`}>
      <div className="about-award-image-wrap">
        {imageSrc ? (
          <img src={imageSrc} alt={project} className="about-award-img" style={{ objectPosition: item.imagePosition || '50% 50%' }} />
        ) : (
          <div className="about-award-img-placeholder">
            <Trophy size={36} className="about-award-trophy-placeholder" />
          </div>
        )}
        <div className="about-award-year-tag">{year}</div>
      </div>
      <div className="about-award-info">
        <div className="about-award-rank-wrap">
          <Trophy size={14} className="about-award-trophy-icon" />
          <span className="about-award-rank">{award}</span>
        </div>
        <h4 className="about-award-project">{project}</h4>

        <div className="about-award-meta-grid">
          <div className="about-award-meta-item">
            <MapPin size={12} />
            <span>{location}</span>
          </div>
          <div className="about-award-meta-item about-award-meta-item--office">
            <Building2 size={12} />
            <span>{officeDisplay}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── MAIN PAGE ─────────────────────────── */

export default function About({ onViewChange, awards = [], backendUrl = '' }) {
  const [activeTab, setActiveTab] = useState('civic');
  const [showTopBtn, setShowTopBtn] = useState(false);

  // Only show awards managed from the Admin Panel
  const displayAwards = Array.isArray(awards) ? awards : [];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const handleScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const activeTabData = PORTFOLIO_TABS.find(t => t.id === activeTab);

  return (
    <div className="about-page">

      {/* ── HERO / BIO SPLIT ── */}
      <section className="about-hero">
        <div className="about-hero__bg-lines" aria-hidden="true">
          {[...Array(8)].map((_, i) => <div key={i} className="about-hero__bg-line" />)}
        </div>

        <div className="about-hero__inner container">
          {/* Portrait */}
          <div className="about-hero__portrait-col">
            <div className="about-portrait-frame">
              <div className="about-portrait-frame__corner about-portrait-frame__corner--tl" />
              <div className="about-portrait-frame__corner about-portrait-frame__corner--br" />
              <img src={ramiPhoto} alt="Architect Rami Khaled Arnaout" className="about-portrait-img" />
              <div className="about-portrait-frame__accent-line" />
            </div>
            <div className="about-portrait-location">
              <MapPin size={14} />
              <span>Amman, Jordan</span>
            </div>
          </div>

          {/* Bio */}
          <div className="about-hero__bio-col">
            <SectionLabel text="The Architect" />
            <h1 className="about-hero__name">
              Rami Khaled<br /><em>Arnaout</em>
            </h1>
            <p className="about-hero__title">
              Architectural Design Consultant<br />
              <span>Founder — Rami Arnaout Architects</span>
            </p>

            <div className="about-stats-grid">
              {STATS.map(s => <StatBadge key={s.label} value={s.value} label={s.label} Icon={s.icon} />)}
            </div>

            <p className="about-hero__bio">
              Rami Arnaout is a well-recognized, award-winning architectural design consultant with
              over 30 years of expertise and a portfolio of 80+ delivered landmark projects across
              the Arab world. His work spans private luxury residential villas, civic museums,
              commercial complexes, mega-scale urban planning, and sacred Islamic architecture.
              As Lead Designer on landmark regional projects and prestigious international
              competitions, Architect Rami Arnaout combines cultural context, modern functionalism,
              and spatial elegance.
            </p>

            <div className="about-hero__cta-row">
              <a href="mailto:ramiarnaout@yahoo.com" className="about-cta-btn about-cta-btn--primary">
                <Mail size={16} /> Get in Touch
              </a>
              <button
                className="about-cta-btn about-cta-btn--ghost"
                onClick={() => document.getElementById('about-competitions')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Award size={16} /> View Awards
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── DESIGN PROCESS SHOWCASE ── */}
      <AnimatedSection>
        <section className="about-section about-process">
          <div className="container">
            <SectionLabel text="The Design Process" />
            <h2 className="about-section__heading">From Concept to Built Reality</h2>
            <ProcessShowcase />
          </div>
        </section>
      </AnimatedSection>

      {/* ── CAREER TIMELINE ── */}
      <AnimatedSection>
        <section className="about-section about-career">
          <div className="container">
            <SectionLabel text="Career Journey" />
            <h2 className="about-section__heading">Professional Timeline</h2>
            <div className="about-timeline">
              {CAREER.map((item, idx) => (
                <div key={idx} className={`about-timeline-item ${item.type === 'founder' ? 'about-timeline-item--founder' : ''}`}>
                  <div className="about-timeline-item__dot" />
                  <div className="about-timeline-item__content">
                    <span className="about-timeline-item__period">{item.period}</span>
                    <h4 className="about-timeline-item__role">{item.role}</h4>
                    <p className="about-timeline-item__org">{item.org}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── COMPETITIONS & AWARDS ── */}
      <AnimatedSection>
        <section id="about-competitions" className="about-section about-competitions">
          <div className="container">
            <SectionLabel text="Competitions & Awards" />
            <h2 className="about-section__heading">Award-Winning Record</h2>
            <div className="about-awards-grid">
              {displayAwards.length > 0 ? (
                displayAwards.map((item, idx) => (
                  <AwardCard key={item.id || idx} item={item} backendUrl={backendUrl} />
                ))
              ) : (
                <p style={{ color: 'var(--text-muted, #666)', fontStyle: 'italic', padding: '2rem 0' }}>
                  No awards added yet. Use the Admin Panel to add competition records.
                </p>
              )}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── PORTFOLIO TABS ── */}
      <AnimatedSection>
        <section className="about-section about-portfolio">
          <div className="container">
            <SectionLabel text="Landmark Portfolio" />
            <h2 className="about-section__heading">Selected Masterpieces</h2>

            <div className="about-tabs">
              {PORTFOLIO_TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`about-tab-btn ${activeTab === tab.id ? 'about-tab-btn--active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTabData && (
              <div className="about-tab-content">
                {activeTabData.items.map((item, idx) => (
                  <div key={idx} className="about-portfolio-item">
                    <span className="about-portfolio-item__num">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="about-portfolio-item__name">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </AnimatedSection>

      {/* ── ACADEMIC SECTION ── */}
      <AnimatedSection>
        <section className="about-section about-academic">
          <div className="container">
            <SectionLabel text="Academia & Research" />
            <h2 className="about-section__heading">Education & Teaching</h2>

            <div className="about-academic-grid">
              {/* Education */}
              <div className="about-academic-block">
                <h3 className="about-academic-block__title">
                  <GraduationCap size={20} /> Degrees
                </h3>
                {EDUCATION.map((e, i) => (
                  <div key={i} className="about-academic-card">
                    <span className="about-academic-card__year">{e.year}</span>
                    <div>
                      <p className="about-academic-card__degree">{e.degree}</p>
                      <p className="about-academic-card__school">{e.school}</p>
                      {e.note && <span className="about-academic-card__note">{e.note}</span>}
                    </div>
                  </div>
                ))}
              </div>
              
              

              {/* Academic Appointments */}
              <div className="about-academic-block">
                <h3 className="about-academic-block__title">
                  <BookOpen size={20} /> Teaching Appointments
                </h3>
                {ACADEMIC_ROLES.map((r, i) => (
                  <div key={i} className="about-academic-card">
                    <span className="about-academic-card__year">{r.period}</span>
                    <div>
                      <p className="about-academic-card__degree">{r.role}</p>
                      <p className="about-academic-card__school">{r.inst}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Publications */}
            <div className="about-publications">
              <h3 className="about-publications__title"><BookOpen size={18} /> Research & Publications</h3>
              <div className="about-publications-list">
                {PUBLICATIONS.map((pub, i) => (
                  <div key={i} className="about-pub-item">
                    <span className="about-pub-item__type">{pub.type}</span>
                    <p className="about-pub-item__title">"{pub.title}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── CONTACT CARD ── */}
      <AnimatedSection>
        <section className="about-section about-contact-section">
          <div className="container">
            <SectionLabel text="Get in Touch" />
            <h2 className="about-section__heading">Let's Build Together</h2>

            <div className="about-contact-card">
              <div className="about-contact-card__info">
                <div className="about-contact-item">
                  <div className="about-contact-item__icon-wrap">
                    <Mail size={20} />
                  </div>
                  <div>
                    <span className="about-contact-item__label">Email</span>
                    <a href="mailto:ramiarnaout@yahoo.com" className="about-contact-item__value">
                      ramiarnaout@yahoo.com
                    </a>
                  </div>
                </div>

                <div className="about-contact-item">
                  <div className="about-contact-item__icon-wrap">
                    <Phone size={20} />
                  </div>
                  <div>
                    <span className="about-contact-item__label">Phone / WhatsApp</span>
                    <a href="tel:+962795637851" className="about-contact-item__value">
                      +962 79 563 7851
                    </a>
                  </div>
                </div>

                <div className="about-contact-item">
                  <div className="about-contact-item__icon-wrap">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className="about-contact-item__label">Studio Location</span>
                    <span className="about-contact-item__value">Fifth Circle, Amman, Jordan</span>
                  </div>
                </div>

              </div>

              <div className="about-contact-card__cta">
                <p className="about-contact-card__tagline">
                  Open to commissions across the Arab region and beyond — residential, civic, sacred, and urban scale.
                </p>
                <a href="mailto:ramiarnaout@yahoo.com" className="about-contact-send-btn">
                  <Mail size={18} /> Send a Message <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── BACK TO TOP ── */}
      {showTopBtn && (
        <button className="about-back-to-top" onClick={scrollTop} title="Back to top">
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  );
}
