import React, { useState, useEffect, useRef } from 'react';
import { Lock, Plus, Edit, Trash2, Upload, FileText, ArrowLeft, Image as ImageIcon } from 'lucide-react';

function ImagePositionControls({ value, onChange }) {
  const parts = (value || '50% 50%').split(' ');
  const x = parseInt(parts[0]) || 50;
  const y = parseInt(parts[1]) || 50;

  const move = (dir) => {
    let newX = x;
    let newY = y;
    if (dir === 'left') newX = Math.max(0, x - 5);
    if (dir === 'right') newX = Math.min(100, x + 5);
    if (dir === 'up') newY = Math.max(0, y - 5);
    if (dir === 'down') newY = Math.min(100, y + 5);
    onChange(`${newX}% ${newY}%`);
  };

  return (
    <div className="image-position-controls" style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '4px' }}>
      <button type="button" onClick={() => move('left')} title="Move Left" style={{ padding: '2px 6px', fontSize: '0.75rem', background: '#222', border: '1px solid #44', color: '#fff', cursor: 'pointer' }}>←</button>
      <button type="button" onClick={() => move('up')} title="Move Up" style={{ padding: '2px 6px', fontSize: '0.75rem', background: '#222', border: '1px solid #44', color: '#fff', cursor: 'pointer' }}>↑</button>
      <button type="button" onClick={() => move('down')} title="Move Down" style={{ padding: '2px 6px', fontSize: '0.75rem', background: '#222', border: '1px solid #44', color: '#fff', cursor: 'pointer' }}>↓</button>
      <button type="button" onClick={() => move('right')} title="Move Right" style={{ padding: '2px 6px', fontSize: '0.75rem', background: '#222', border: '1px solid #44', color: '#fff', cursor: 'pointer' }}>→</button>
      <span style={{ fontSize: '0.7rem', color: '#aaa', marginLeft: '4px', fontFamily: 'monospace' }}>{x}% {y}%</span>
    </div>
  );
}

export default function AdminPanel({
  initialAuthenticated = false,
  onLockDashboard,
  onUnlockDashboard,
  projects,
  categories,
  awards = [],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onAddAward,
  onUpdateAward,
  onDeleteAward,
  backendUrl
}) {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(initialAuthenticated));
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState('projects'); // 'projects' or 'categories'

  // Project Form State
  const [editingProject, setEditingProject] = useState(null); // null means adding a new one
  const [projectTitle, setProjectTitle] = useState('');
  const [projectCategory, setProjectCategory] = useState('');
  const [projectDate, setProjectDate] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectFiles, setProjectFiles] = useState([]); // File objects
  const [existingProjectImages, setExistingProjectImages] = useState([]); // string URLs (for editing)
  const [existingProjectPublicIds, setExistingProjectPublicIds] = useState([]);
  const [existingProjectResourceTypes, setExistingProjectResourceTypes] = useState([]);
  const [projectFilesPreview, setProjectFilesPreview] = useState([]); // string blobs for new uploads
  const [projectImagePositions, setProjectImagePositions] = useState([]); // array of "X% Y%"

  // Category Form State
  const [editingCategory, setEditingCategory] = useState(null); // null means adding a new one
  const [categoryName, setCategoryName] = useState('');
  const [categoryFile, setCategoryFile] = useState(null);
  const [categoryFilePreview, setCategoryFilePreview] = useState('');
  const [categoryImagePosition, setCategoryImagePosition] = useState('50% 50%');

  // Award Form State
  const [editingAward, setEditingAward] = useState(null);
  const [awardTitle, setAwardTitle] = useState('');
  const [awardYear, setAwardYear] = useState('');
  const [awardLocation, setAwardLocation] = useState('');
  const [awardPlace, setAwardPlace] = useState('1st Prize'); // default
  const [awardOffice, setAwardOffice] = useState('Rami Arnaout Architects'); // default
  const [awardFile, setAwardFile] = useState(null);
  const [existingAwardImage, setExistingAwardImage] = useState('');
  const [awardFilePreview, setAwardFilePreview] = useState('');
  const [awardImagePosition, setAwardImagePosition] = useState('50% 50%');

  // Handle Passcode verification
  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode.trim() === 'adminrami56') {
      setIsAuthenticated(true);
      setAuthError('');
      onUnlockDashboard?.();
    } else {
      setAuthError('Invalid passcode. Try "adminrami56"');
    }
  };

  // Setup form when editing project
  useEffect(() => {
    if (editingProject) {
      setProjectTitle(editingProject.title);
      setProjectCategory(editingProject.category);
      setProjectDate(editingProject.date);
      setProjectLocation(editingProject.location);
      setProjectDescription(editingProject.description);
      setExistingProjectImages(editingProject.images || []);
      setExistingProjectPublicIds(editingProject.imagePublicIds || []);
      setExistingProjectResourceTypes(editingProject.imageResourceTypes || []);
      setProjectFiles([]);
      setProjectFilesPreview([]);
      setProjectImagePositions(editingProject.imagePositions || (editingProject.images || []).map(() => '50% 50%'));
    } else {
      clearProjectForm();
    }
  }, [editingProject]);

  const clearProjectForm = () => {
    setProjectTitle('');
    setProjectCategory(categories[0]?.id || '');
    setProjectDate(new Date().getFullYear().toString());
    setProjectLocation('');
    setProjectDescription('');
    setProjectFiles([]);
    setExistingProjectImages([]);
    setExistingProjectPublicIds([]);
    setExistingProjectResourceTypes([]);
    setProjectFilesPreview([]);
    setProjectImagePositions([]);
    setEditingProject(null);
  };

  // Setup form when editing category
  useEffect(() => {
    if (editingCategory) {
      setCategoryName(editingCategory.name);
      setCategoryFile(null);
      setCategoryFilePreview(editingCategory.image ? (editingCategory.image.startsWith('http') || editingCategory.image.startsWith('/uploads') ? `${backendUrl}${editingCategory.image}` : editingCategory.image) : '');
      setCategoryImagePosition(editingCategory.imagePosition || '50% 50%');
    } else {
      clearCategoryForm();
    }
  }, [editingCategory]);

  const clearCategoryForm = () => {
    setCategoryName('');
    setCategoryFile(null);
    setCategoryFilePreview('');
    setCategoryImagePosition('50% 50%');
    setEditingCategory(null);
  };

  const clearAwardForm = () => {
    setAwardTitle('');
    setAwardYear('');
    setAwardLocation('');
    setAwardPlace('1st Prize');
    setAwardOffice('Rami Arnaout Architects');
    setAwardFile(null);
    setExistingAwardImage('');
    setAwardFilePreview('');
    setAwardImagePosition('50% 50%');
    setEditingAward(null);
  };

  // Setup form when editing award
  useEffect(() => {
    if (editingAward) {
      setAwardTitle(editingAward.project || editingAward.title || '');
      setAwardYear(editingAward.year || '');
      setAwardLocation(editingAward.location || '');
      setAwardPlace(editingAward.award || '1st Prize');
      setAwardOffice(editingAward.office || 'Rami Arnaout Architects');
      setExistingAwardImage(editingAward.image || '');
      setAwardFile(null);
      setAwardFilePreview('');
      setAwardImagePosition(editingAward.imagePosition || '50% 50%');
    } else {
      clearAwardForm();
    }
  }, [editingAward]);

  // Image Upload Previews
  const handleProjectFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setProjectFiles(prev => [...prev, ...files]);

    const previews = files.map(file => URL.createObjectURL(file));
    setProjectFilesPreview(prev => [...prev, ...previews]);
    setProjectImagePositions(prev => [...prev, ...files.map(() => '50% 50%')]);
  };

  const removeNewProjectImage = (index) => {
    setProjectFiles(prev => prev.filter((_, i) => i !== index));
    setProjectFilesPreview(prev => prev.filter((_, i) => i !== index));
    const realIdx = existingProjectImages.length + index;
    setProjectImagePositions(prev => prev.filter((_, i) => i !== realIdx));
  };

  const removeExistingProjectImage = (index) => {
    setExistingProjectImages(prev => prev.filter((_, i) => i !== index));
    setExistingProjectPublicIds(prev => prev.filter((_, i) => i !== index));
    setExistingProjectResourceTypes(prev => prev.filter((_, i) => i !== index));
    setProjectImagePositions(prev => prev.filter((_, i) => i !== index));
  };

  const handleCategoryFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryFile(file);
      setCategoryFilePreview(URL.createObjectURL(file));
    }
  };

  const handleAwardFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAwardFile(file);
      setAwardFilePreview(URL.createObjectURL(file));
    }
  };

  // Submit handlers
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectTitle || !projectCategory) {
      alert('Title and Category are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', projectTitle);
    formData.append('category', projectCategory);
    formData.append('date', projectDate);
    formData.append('location', projectLocation);
    formData.append('description', projectDescription);
    formData.append('imagePositions', JSON.stringify(projectImagePositions));

    projectFiles.forEach(file => {
      formData.append('images', file);
    });

    if (editingProject) {
      formData.append('existingImages', JSON.stringify(existingProjectImages));
      formData.append('existingImagePublicIds', JSON.stringify(existingProjectPublicIds));
      formData.append('existingImageResourceTypes', JSON.stringify(existingProjectResourceTypes));
      await onUpdateProject(editingProject.id, formData);
    } else {
      await onAddProject(formData);
    }

    clearProjectForm();
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryName) {
      alert('Category Name is required');
      return;
    }

    const formData = new FormData();
    formData.append('name', categoryName);
    formData.append('imagePosition', categoryImagePosition);
    if (categoryFile) {
      formData.append('image', categoryFile);
    }

    if (editingCategory) {
      await onUpdateCategory(editingCategory.id, formData);
    } else {
      await onAddCategory(formData);
    }
    clearCategoryForm();
  };

  const handleAwardSubmit = async (e) => {
    e.preventDefault();
    if (!awardTitle || !awardYear) {
      alert('Award Project Title and Year are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', awardTitle);
    formData.append('year', awardYear);
    formData.append('location', awardLocation);
    formData.append('awardPlace', awardPlace);
    formData.append('office', awardOffice);
    formData.append('imagePosition', awardImagePosition);
    if (awardFile) {
      formData.append('image', awardFile);
    }

    if (editingAward) {
      await onUpdateAward(editingAward.id, formData);
    } else {
      await onAddAward(formData);
    }
    clearAwardForm();
  };

  if (!isAuthenticated) {
    return (
      <div className="container auth-wall">
        <div className="auth-card">
          <Lock className="auth-icon" size={48} />
          <h3>Admin Authentication</h3>
          <p>Please enter the passcode to access the office dashboard.</p>
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <input
                type="password"
                placeholder="Enter reserved passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '0.2em' }}
                autoFocus
              />
              {authError && <span className="auth-error">{authError}</span>}
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <section className="container admin-section">
      <div className="admin-header">
        <div>
          <span className="section-subtitle">Office Administration</span>
          <h2 className="section-title" style={{ fontSize: '1.8rem' }}>Control Panel</h2>
        </div>
        <button className="btn-secondary" onClick={() => {
          setIsAuthenticated(false);
          onLockDashboard?.();
        }} style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}>
          Lock Dashboard
        </button>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => { setActiveTab('projects'); clearProjectForm(); }}
        >
          Manage Projects
        </button>
        <button
          className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => { setActiveTab('categories'); clearCategoryForm(); }}
        >
          Manage Categories
        </button>
        <button
          className={`admin-tab ${activeTab === 'awards' ? 'active' : ''}`}
          onClick={() => { setActiveTab('awards'); clearAwardForm(); }}
        >
          Manage Awards
        </button>
      </div>

      {activeTab === 'projects' ? (
        <div>
          {/* Project Form */}
          <div className="admin-form-container">
            <h3 className="form-title">
              {editingProject ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={clearProjectForm}>
                  <ArrowLeft size={18} /> Edit Project: {editingProject.title}
                </span>
              ) : 'Add New Architectural Project'}
            </h3>

            <form onSubmit={handleProjectSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Project Title *</label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={e => setProjectTitle(e.target.value)}
                    placeholder="e.g. Modern Curved Villa"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={projectCategory}
                    onChange={e => setProjectCategory(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Date Made</label>
                  <input
                    type="text"
                    value={projectDate}
                    onChange={e => setProjectDate(e.target.value)}
                    placeholder="e.g. 2023 (1444 H) or 2022"
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={projectLocation}
                    onChange={e => setProjectLocation(e.target.value)}
                    placeholder="e.g. Fifth Circle, Amman, Jordan"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Project Description</label>
                  <textarea
                    value={projectDescription}
                    onChange={e => setProjectDescription(e.target.value)}
                    placeholder="Describe the architectural design concept, materials used, structural features..."
                  />
                </div>

                {/* Upload Section */}
                <div className="form-group full-width">
                  <label>Project Images & Videos (Multiple uploads supported)</label>
                  <div className="upload-zone" onClick={() => document.getElementById('project-files-input').click()}>
                    <Upload className="upload-icon" size={32} />
                    <p>Click here or drag files to upload</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>JPG, PNG, WEBP, MP4, MOV, WEBM files supported</span>
                    <input
                      id="project-files-input"
                      type="file"
                      multiple
                      onChange={handleProjectFilesChange}
                      style={{ display: 'none' }}
                      accept="image/*,video/*"
                    />
                  </div>

                  {/* Previews */}
                  {(existingProjectImages.length > 0 || projectFilesPreview.length > 0) && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Selected Media (First item becomes main cover):</span>
                      <div className="upload-preview-container" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {/* Existing Media */}
                        {existingProjectImages.map((img, idx) => {
                          const pos = projectImagePositions[idx] || '50% 50%';
                          const isVideo = existingProjectResourceTypes[idx] === 'video' || img.includes('/video/upload/') || /\.(mp4|mov|webm|ogv)($|\?)/i.test(img);
                          return (
                            <div key={`existing-${idx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div className="upload-preview-card" style={{ border: idx === 0 ? '2px solid var(--accent-orange)' : '', position: 'relative' }}>
                                {isVideo ? (
                                  <video
                                    src={img.startsWith('http') || img.startsWith('/uploads') ? `${backendUrl}${img}` : img}
                                    className="upload-preview-img"
                                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                    controls
                                  />
                                ) : (
                                  <img
                                    src={img.startsWith('http') || img.startsWith('/uploads') ? `${backendUrl}${img}` : img}
                                    alt="Existing Preview"
                                    className="upload-preview-img"
                                    style={{ objectPosition: pos }}
                                  />
                                )}
                                <button type="button" className="upload-preview-remove" onClick={() => removeExistingProjectImage(idx)}>×</button>
                              </div>
                              {!isVideo && (
                                <ImagePositionControls
                                  value={pos}
                                  onChange={(newPos) => {
                                    const next = [...projectImagePositions];
                                    next[idx] = newPos;
                                    setProjectImagePositions(next);
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                        {/* New Media */}
                        {projectFilesPreview.map((blob, idx) => {
                          const realIdx = existingProjectImages.length + idx;
                          const pos = projectImagePositions[realIdx] || '50% 50%';
                          const isVideo = projectFiles[idx]?.type.startsWith('video/') || projectFiles[idx]?.name.match(/\.(mp4|mov|webm|ogv)($|\?)/i);
                          return (
                            <div key={`new-${idx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div className="upload-preview-card" style={{ border: (idx + existingProjectImages.length) === 0 ? '2px solid var(--accent-orange)' : '', position: 'relative' }}>
                                {isVideo ? (
                                  <video
                                    src={blob}
                                    className="upload-preview-img"
                                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                    controls
                                  />
                                ) : (
                                  <img
                                    src={blob}
                                    alt="New Preview"
                                    className="upload-preview-img"
                                    style={{ objectPosition: pos }}
                                  />
                                )}
                                <button type="button" className="upload-preview-remove" onClick={() => removeNewProjectImage(idx)}>×</button>
                              </div>
                              {!isVideo && (
                                <ImagePositionControls
                                  value={pos}
                                  onChange={(newPos) => {
                                    const next = [...projectImagePositions];
                                    next[realIdx] = newPos;
                                    setProjectImagePositions(next);
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                {editingProject && (
                  <button type="button" className="btn-secondary" onClick={clearProjectForm}>
                    Cancel Edit
                  </button>
                )}
                <button type="submit" className="btn-primary">
                  {editingProject ? 'Save Changes' : 'Publish Project'}
                </button>
              </div>
            </form>
          </div>

          {/* Projects List */}
          <div style={{ marginTop: '4rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>Current Projects ({projects.length})</h3>
            <div className="admin-items-list">
              {projects.map(proj => {
                const catName = categories.find(c => c.id === proj.category)?.name || 'General';
                return (
                  <div key={proj.id} className="admin-list-item">
                    <div className="admin-item-left">
                      {(() => {
                        const mainImg = proj.mainImage.startsWith('http') || proj.mainImage.startsWith('/uploads') ? `${backendUrl}${proj.mainImage}` : proj.mainImage;
                        const isVid = proj.mainImageResourceType === 'video' || mainImg.includes('/video/upload/') || /\.(mp4|mov|webm|ogv)($|\?)/i.test(mainImg);
                        return isVid ? (
                          <video
                            src={mainImg}
                            className="admin-item-thumb"
                            muted
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <img
                            src={mainImg}
                            className="admin-item-thumb"
                            alt=""
                            style={{ objectPosition: (proj.imagePositions && proj.imagePositions[0]) || '50% 50%' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `${backendUrl}/uploads/logo.png`;
                            }}
                          />
                        );
                      })()}
                      <div className="admin-item-info">
                        <h4>{proj.title}</h4>
                        <p>{catName} | {proj.date} | {proj.location}</p>
                      </div>
                    </div>

                    <div className="admin-item-actions">
                      <button className="btn-icon edit-btn" title="Edit" onClick={() => setEditingProject(proj)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon delete-btn" title="Delete" onClick={() => { if (confirm('Are you sure you want to delete this project?')) onDeleteProject(proj.id) }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : activeTab === 'categories' ? (
        <div>
          {/* Category Form */}
          <div className="admin-form-container">
            <h3 className="form-title">
              {editingCategory ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={clearCategoryForm}>
                  <ArrowLeft size={18} /> Edit Category: {editingCategory.name}
                </span>
              ) : 'Create Project Category'}
            </h3>
            <form onSubmit={handleCategorySubmit}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={e => setCategoryName(e.target.value)}
                    placeholder="e.g. Villas, Compounds, Mosques..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category Preview Image</label>
                  <div className="upload-zone" onClick={() => document.getElementById('category-file-input').click()}>
                    <Upload className="upload-icon" size={32} />
                    <p>Click here to upload category preview photo</p>
                    <input
                      id="category-file-input"
                      type="file"
                      onChange={handleCategoryFileChange}
                      style={{ display: 'none' }}
                      accept="image/*"
                    />
                  </div>

                  {categoryFilePreview && (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Selected Photo:</span>
                      <div className="upload-preview-card" style={{ width: '120px', height: '170px', position: 'relative' }}>
                        <img 
                          src={categoryFilePreview} 
                          alt="Category preview" 
                          className="upload-preview-img" 
                          style={{ objectPosition: categoryImagePosition }}
                        />
                      </div>
                      <ImagePositionControls
                        value={categoryImagePosition}
                        onChange={setCategoryImagePosition}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                {editingCategory && (
                  <button type="button" className="btn-secondary" onClick={clearCategoryForm}>
                    Cancel Edit
                  </button>
                )}
                <button type="submit" className="btn-primary">
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>

          {/* Categories List */}
          <div style={{ marginTop: '4rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>Current Categories ({categories.length})</h3>
            <div className="admin-items-list">
              {categories.map(cat => (
                <div key={cat.id} className="admin-list-item">
                  <div className="admin-item-left">
                    <img
                      src={cat.image.startsWith('http') || cat.image.startsWith('/uploads') ? `${backendUrl}${cat.image}` : cat.image}
                      className="admin-item-thumb"
                      alt=""
                      style={{ height: '70px', width: '50px', borderRadius: '4px', objectFit: 'cover', objectPosition: cat.imagePosition || '50% 50%' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `${backendUrl}/uploads/logo.png`;
                      }}
                    />
                    <div className="admin-item-info">
                      <h4>{cat.name}</h4>
                      <p>ID: {cat.id}</p>
                    </div>
                  </div>

                  <div className="admin-item-actions">
                    <button className="btn-icon edit-btn" title="Edit Category" onClick={() => setEditingCategory(cat)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn-icon delete-btn" title="Delete Category" onClick={() => { if (confirm(`Are you sure you want to delete category "${cat.name}"? Related projects will be set to general.`)) onDeleteCategory(cat.id) }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Awards Form */}
          <div className="admin-form-container">
            <h3 className="form-title">
              {editingAward ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={clearAwardForm}>
                  <ArrowLeft size={18} /> Edit Award: {editingAward.project}
                </span>
              ) : 'Add New Competition / Award'}
            </h3>

            <form onSubmit={handleAwardSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Project / Competition Title *</label>
                  <input
                    type="text"
                    value={awardTitle}
                    onChange={e => setAwardTitle(e.target.value)}
                    placeholder="e.g. Amman Chamber of Industry"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Year *</label>
                  <input
                    type="text"
                    value={awardYear}
                    onChange={e => setAwardYear(e.target.value)}
                    placeholder="e.g. 2022"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={awardLocation}
                    onChange={e => setAwardLocation(e.target.value)}
                    placeholder="e.g. Amman, Jordan"
                  />
                </div>

                <div className="form-group">
                  <label>Award / Position</label>
                  <select
                    value={awardPlace}
                    onChange={e => setAwardPlace(e.target.value)}
                    required
                  >
                    <option value="1st Prize">1st Prize</option>
                    <option value="2nd Prize">2nd Prize</option>
                    <option value="3rd Prize">3rd Prize</option>
                    <option value="Shortlisted">Shortlisted</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Affiliated Office / Context *</label>
                  <select
                    value={awardOffice}
                    onChange={e => setAwardOffice(e.target.value)}
                    required
                  >
                    <option value="Rami Arnaout Architects">Rami Arnaout Architects (≥ 2010)</option>
                    <option value="DAR AL-OMRAN">DAR AL-OMRAN (Before 2010)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Award Preview Image</label>
                  <div className="upload-zone" onClick={() => document.getElementById('award-file-input').click()}>
                    <Upload className="upload-icon" size={32} />
                    <p>Upload award preview photo</p>
                    <input
                      id="award-file-input"
                      type="file"
                      onChange={handleAwardFileChange}
                      style={{ display: 'none' }}
                      accept="image/*"
                    />
                  </div>

                  {(awardFilePreview || existingAwardImage) && (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Selected Photo:</span>
                      <div className="upload-preview-card" style={{ width: '120px', height: '120px', position: 'relative' }}>
                        <img
                          src={awardFilePreview || (existingAwardImage.startsWith('http') || existingAwardImage.startsWith('/uploads') ? `${backendUrl}${existingAwardImage}` : existingAwardImage)}
                          alt="Award preview"
                          className="upload-preview-img"
                          style={{ objectPosition: awardImagePosition }}
                        />
                      </div>
                      <ImagePositionControls
                        value={awardImagePosition}
                        onChange={setAwardImagePosition}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                {editingAward && (
                  <button type="button" className="btn-secondary" onClick={clearAwardForm}>
                    Cancel Edit
                  </button>
                )}
                <button type="submit" className="btn-primary">
                  {editingAward ? 'Save Changes' : 'Add Award'}
                </button>
              </div>
            </form>
          </div>

          {/* Awards List */}
          <div style={{ marginTop: '4rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>Current Awards ({awards.length})</h3>
            <div className="admin-items-list">
              {awards.map(aw => (
                <div key={aw.id} className="admin-list-item">
                  <div className="admin-item-left">
                    <img
                      src={aw.image ? (aw.image.startsWith('http') || aw.image.startsWith('/uploads') ? `${backendUrl}${aw.image}` : aw.image) : `${backendUrl}/uploads/logo.png`}
                      className="admin-item-thumb"
                      alt=""
                      style={{ height: '70px', width: '70px', borderRadius: '4px', objectFit: 'cover', objectPosition: aw.imagePosition || '50% 50%' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `${backendUrl}/uploads/logo.png`;
                      }}
                    />
                    <div className="admin-item-info">
                      <h4>{aw.project}</h4>
                      <p>{aw.award} | {aw.year} | {aw.location} ({aw.office})</p>
                    </div>
                  </div>

                  <div className="admin-item-actions">
                    <button className="btn-icon edit-btn" title="Edit Award" onClick={() => setEditingAward(aw)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn-icon delete-btn" title="Delete Award" onClick={() => { if (confirm(`Are you sure you want to delete award for "${aw.project}"?`)) onDeleteAward(aw.id) }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
