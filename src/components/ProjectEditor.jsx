import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Upload, Plus, Trash2, Edit2, X, Check, ArrowUp, ArrowDown, Github, Twitter, Linkedin, Globe, Mail, Phone, MapPin, Link, Calendar, Flag, Home, Briefcase, User } from 'lucide-react';

const ProjectEditor = ({
    project,
    entries,
    styles = {},
    onUpdateProject,
    onEditEntry,
    onDeleteEntry,
    onReorderEntries,
    onReorderEducation,
    onReorderCourses,
    onReorderSkills
}) => {
    const [activeTab, setActiveTab] = useState('personal');
    const [uploading, setUploading] = useState(false);

    // Local state for skills
    const [isAddingSkill, setIsAddingSkill] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    // Local state for new/editing education/course items
    const [isAddingEdu, setIsAddingEdu] = useState(false);
    const [newEdu, setNewEdu] = useState({ school: '', degree: '', year: '', description: '' });
    const [editingEduIndex, setEditingEduIndex] = useState(null);
    const [editEduData, setEditEduData] = useState({});

    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [newCourse, setNewCourse] = useState({ name: '', year: '', image: '' });
    const [editingCourseIndex, setEditingCourseIndex] = useState(null);
    const [editCourseData, setEditCourseData] = useState({});

    const handleFileUpload = async (event, targetField, targetObj = null, setTargetObj = null) => {
        try {
            setUploading(true);
            const file = event.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            let bucket = 'cv-photos';

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

            if (setTargetObj) {
                // Updating local state (e.g. new course)
                setTargetObj({ ...targetObj, image: data.publicUrl });
            } else {
                // Updating project field directly
                onUpdateProject({ [targetField]: data.publicUrl });
            }

        } catch (error) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (e, field) => {
        onUpdateProject({ [field]: e.target.value });
    };

    // --- Education Handlers ---
    const addEducation = () => {
        const currentEducation = project.education || [];
        onUpdateProject({ education: [...currentEducation, newEdu] });
        setIsAddingEdu(false);
        setNewEdu({ school: '', degree: '', year: '', description: '' });
    };

    const deleteEducation = (index) => {
        const currentEducation = project.education || [];
        const updated = currentEducation.filter((_, i) => i !== index);
        onUpdateProject({ education: updated });
    };

    const startEditingEdu = (index, edu) => {
        setEditingEduIndex(index);
        setEditEduData(edu);
    };

    const saveEditingEdu = () => {
        const currentEducation = [...(project.education || [])];
        currentEducation[editingEduIndex] = editEduData;
        onUpdateProject({ education: currentEducation });
        setEditingEduIndex(null);
    };

    // --- Course Handlers ---
    const addCourse = () => {
        const currentCourses = project.courses || [];
        onUpdateProject({ courses: [...currentCourses, newCourse] });
        setIsAddingCourse(false);
        setNewCourse({ name: '', year: '', image: '' });
    };

    const deleteCourse = (index) => {
        const currentCourses = project.courses || [];
        const updated = currentCourses.filter((_, i) => i !== index);
        onUpdateProject({ courses: updated });
    };

    const startEditingCourse = (index, course) => {
        setEditingCourseIndex(index);
        setEditCourseData(course);
    };

    const saveEditingCourse = () => {
        const currentCourses = [...(project.courses || [])];
        currentCourses[editingCourseIndex] = editCourseData;
        onUpdateProject({ courses: currentCourses });
        setEditingCourseIndex(null);
    };

    // --- Skills Handlers ---
    const addSkill = () => {
        if (!newSkill.trim()) return;
        const currentSkills = project.skills || [];
        onUpdateProject({ skills: [...currentSkills, newSkill] });
        setNewSkill('');
        setIsAddingSkill(false);
    };

    const deleteSkill = (index) => {
        const currentSkills = project.skills || [];
        const updated = currentSkills.filter((_, i) => i !== index);
        onUpdateProject({ skills: updated });
    };

    // --- Custom Contact Handlers ---
    const addCustomContact = () => {
        const current = project.custom_contacts || [];
        onUpdateProject({ custom_contacts: [...current, { icon: 'Link', value: '' }] });
    };

    const updateCustomContact = (index, field, value) => {
        const current = [...(project.custom_contacts || [])];
        current[index] = { ...current[index], [field]: value };
        onUpdateProject({ custom_contacts: current });
    };

    const removeCustomContact = (index) => {
        const current = project.custom_contacts || [];
        const updated = current.filter((_, i) => i !== index);
        onUpdateProject({ custom_contacts: updated });
    };

    const importDefaultExperience = async () => {
        if (!window.confirm("Import default experience? This will append to your current list.")) return;

        const { data: profile } = await supabase.from('profiles').select('experience').eq('id', project.user_id).single();

        if (profile?.experience && profile.experience.length > 0) {
            const newEntries = profile.experience.map((entry, index) => ({
                project_id: project.id,
                user_id: project.user_id,
                company: entry.company,
                role: entry.role,
                period: entry.period,
                description: entry.description,
                sort_order: (entries.length || 0) + index
            }));

            const { error } = await supabase.from('project_entries').insert(newEntries);
            if (error) alert("Import failed: " + error.message);
            // Parent component ProjectView listens to postgres_changes and will refresh
        } else {
            alert("No default experience found in your profile.");
        }
    };

    return (
        <div className="editor-sidebar no-print">
            <div className="editor-tabs">
                <button className={activeTab === 'personal' ? 'active' : ''} onClick={() => setActiveTab('personal')}>Personal</button>
                <button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}>Design 🎨</button>
                <button className={activeTab === 'experience' ? 'active' : ''} onClick={() => setActiveTab('experience')}>Exp</button>
                <button className={activeTab === 'education' ? 'active' : ''} onClick={() => setActiveTab('education')}>Edu</button>
                <button className={activeTab === 'skills' ? 'active' : ''} onClick={() => setActiveTab('skills')}>Skills</button>
                <button className={activeTab === 'courses' ? 'active' : ''} onClick={() => setActiveTab('courses')}>Courses</button>
            </div>

            <div className="editor-content">
                {activeTab === 'personal' && (
                    <div className="editor-section">
                        <h3>Personal Info</h3>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input type="text" value={project.full_name || ''} onChange={(e) => handleInputChange(e, 'full_name')} placeholder="Name" />
                        </div>
                        <div className="input-group">
                            <label>Role</label>
                            <input type="text" value={project.role || ''} onChange={(e) => handleInputChange(e, 'role')} placeholder="Job Title" />
                        </div>

                        <div className="input-group">
                            <label>Profile Photo</label>
                            <div className="photo-upload">
                                {project.photo_url && <img src={project.photo_url} alt="Profile" className="preview-thumb" />}
                                <label className="upload-btn">
                                    <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload'}
                                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'photo_url')} disabled={uploading} />
                                </label>
                            </div>
                        </div>

                        <h3>Contact</h3>
                        <div className="input-group">
                            <label>Email</label>
                            <input type="text" value={project.email || ''} onChange={(e) => handleInputChange(e, 'email')} />
                        </div>
                        <div className="input-group">
                            <label>Phone</label>
                            <input type="text" value={project.phone || ''} onChange={(e) => handleInputChange(e, 'phone')} />
                        </div>
                        <div className="input-group">
                            <label>Location</label>
                            <input type="text" value={project.location || ''} onChange={(e) => handleInputChange(e, 'location')} />
                        </div>
                        <div className="input-group">
                            <label>LinkedIn</label>
                            <input type="text" value={project.linkedin || ''} onChange={(e) => handleInputChange(e, 'linkedin')} />
                        </div>
                        <div className="input-group">
                            <label>Portfolio</label>
                            <input type="text" value={project.portfolio || ''} onChange={(e) => handleInputChange(e, 'portfolio')} />
                        </div>

                        <h4>Custom Contacts</h4>
                        <div className="list-items">
                            {(project.custom_contacts || []).map((item, idx) => (
                                <div key={idx} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                                    <div style={{ display: 'flex', width: '100%', gap: '5px' }}>
                                        <select
                                            value={item.icon}
                                            onChange={(e) => updateCustomContact(idx, 'icon', e.target.value)}
                                            style={{ flex: 1, padding: '5px' }}
                                        >
                                            <option value="Globe">Globe</option>
                                            <option value="Github">Github</option>
                                            <option value="Linkedin">Linkedin</option>
                                            <option value="Twitter">Twitter</option>
                                            <option value="Mail">Mail</option>
                                            <option value="Phone">Phone</option>
                                            <option value="MapPin">MapPin</option>
                                            <option value="Link">Link</option>
                                            <option value="Calendar">Calendar</option>
                                            <option value="Flag">Flag</option>
                                            <option value="Home">Home</option>
                                            <option value="Briefcase">Briefcase</option>
                                            <option value="User">User</option>
                                        </select>
                                        <button onClick={() => removeCustomContact(idx)} className="delete"><Trash2 size={14} /></button>
                                    </div>
                                    <input
                                        placeholder="Value / URL"
                                        value={item.value}
                                        onChange={(e) => updateCustomContact(idx, 'value', e.target.value)}
                                        style={{ width: '100%', boxSizing: 'border-box' }}
                                    />
                                </div>
                            ))}
                            <button className="add-btn" onClick={addCustomContact} style={{ marginTop: '10px' }}><Plus size={14} /> Add Item</button>
                        </div>

                        <h3>Summary</h3>
                        <textarea
                            rows={6}
                            value={project.summary || ''}
                            onChange={(e) => handleInputChange(e, 'summary')}
                            className="summary-input"
                        />
                    </div>
                )}

                {activeTab === 'design' && (
                    <div className="editor-section">
                        <h3>Appearance</h3>

                        <div className="input-group">
                            <label>CV Language</label>
                            <select
                                value={styles.language || 'pl'}
                                onChange={(e) => onUpdateProject({ styles: { ...styles, language: e.target.value } })}
                                style={{ width: '100%', padding: '8px' }}
                            >
                                <option value="pl">Polski</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                checked={styles.showPhoto !== false}
                                onChange={(e) => onUpdateProject({ styles: { ...styles, showPhoto: e.target.checked } })}
                                id="showPhoto"
                            />
                            <label htmlFor="showPhoto" style={{ marginBottom: 0 }}>Show Photo</label>
                        </div>

                        <div className="input-group">
                            <label>Profile Photo Shape</label>
                            <select
                                value={styles.imageShape || 'circle'}
                                onChange={(e) => onUpdateProject({ styles: { ...styles, imageShape: e.target.value } })}
                                style={{ width: '100%', padding: '8px' }}
                            >
                                <option value="circle">Circle</option>
                                <option value="rounded">Rounded Square</option>
                                <option value="square">Square</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Font Family</label>
                            <select
                                value={styles.font || 'Inter'}
                                onChange={(e) => onUpdateProject({ styles: { ...styles, font: e.target.value } })}
                                style={{ width: '100%', padding: '8px' }}
                            >
                                <option value="Inter">Inter (Modern Sans)</option>
                                <option value="Roboto">Roboto (Neutral)</option>
                                <option value="Lato">Lato (Friendly)</option>
                                <option value="Montserrat">Montserrat (Geometric)</option>
                                <option value="Merriweather">Merriweather (Serif)</option>
                                <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
                            </select>
                        </div>

                        <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                checked={styles.nameLayout === 'two-line'}
                                onChange={(e) => onUpdateProject({ styles: { ...styles, nameLayout: e.target.checked ? 'two-line' : 'single' } })}
                                id="nameLayout"
                            />
                            <label htmlFor="nameLayout" style={{ marginBottom: 0 }}>Two-line Name</label>
                        </div>

                        {styles.nameLayout === 'two-line' && (
                            <>
                                <div className="input-group">
                                    <label>First Name Scale ({styles.firstNameScale || 1}x)</label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="3.0"
                                        step="0.1"
                                        value={styles.firstNameScale || 1}
                                        onChange={(e) => onUpdateProject({ styles: { ...styles, firstNameScale: parseFloat(e.target.value) } })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Last Name Scale ({styles.lastNameScale || 1}x)</label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="3.0"
                                        step="0.1"
                                        value={styles.lastNameScale || 1}
                                        onChange={(e) => onUpdateProject({ styles: { ...styles, lastNameScale: parseFloat(e.target.value) } })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </>
                        )}

                        <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                checked={styles.educationLayout === 'swapped'}
                                onChange={(e) => onUpdateProject({ styles: { ...styles, educationLayout: e.target.checked ? 'swapped' : 'standard' } })}
                                id="eduLayout"
                            />
                            <label htmlFor="eduLayout" style={{ marginBottom: 0 }}>Swap School/Degree</label>
                        </div>

                        <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                checked={styles.nameUppercase || false}
                                onChange={(e) => onUpdateProject({ styles: { ...styles, nameUppercase: e.target.checked } })}
                                id="nameUppercase"
                            />
                            <label htmlFor="nameUppercase" style={{ marginBottom: 0 }}>Uppercase Name</label>
                        </div>

                        <h3>Section Headings</h3>
                        <div className="input-group">
                            <label>Heading Scale ({styles.headingScale || 1}x)</label>
                            <input
                                type="range"
                                min="0.8"
                                max="2.0"
                                step="0.1"
                                value={styles.headingScale || 1}
                                onChange={(e) => onUpdateProject({ styles: { ...styles, headingScale: parseFloat(e.target.value) } })}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                checked={styles.headingUppercase !== false} // Default to true
                                onChange={(e) => onUpdateProject({ styles: { ...styles, headingUppercase: e.target.checked } })}
                                id="headingUppercase"
                            />
                            <label htmlFor="headingUppercase" style={{ marginBottom: 0 }}>Uppercase Headings</label>
                        </div>

                        <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                checked={styles.headingUnderline || false}
                                onChange={(e) => onUpdateProject({ styles: { ...styles, headingUnderline: e.target.checked } })}
                                id="headingUnderline"
                            />
                            <label htmlFor="headingUnderline" style={{ marginBottom: 0 }}>Underline Headings</label>
                        </div>

                        <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                checked={styles.headerBackground || false}
                                onChange={(e) => onUpdateProject({ styles: { ...styles, headerBackground: e.target.checked } })}
                                id="headerBackground"
                            />
                            <label htmlFor="headerBackground" style={{ marginBottom: 0 }}>Background Style</label>
                        </div>

                        {styles.headerBackground && (
                            <div style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                                <div className="input-group">
                                    <label>Background Color</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="color"
                                            value={styles.headerBackgroundColor || '#f5f5f5'}
                                            onChange={(e) => onUpdateProject({ styles: { ...styles, headerBackgroundColor: e.target.value } })}
                                        />
                                        <input
                                            type="text"
                                            value={styles.headerBackgroundColor || '#f5f5f5'}
                                            onChange={(e) => onUpdateProject({ styles: { ...styles, headerBackgroundColor: e.target.value } })}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Text Color</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="color"
                                            value={styles.headerTextColor || styles.primaryColor || '#333333'}
                                            onChange={(e) => onUpdateProject({ styles: { ...styles, headerTextColor: e.target.value } })}
                                        />
                                        <input
                                            type="text"
                                            value={styles.headerTextColor || styles.primaryColor || '#333333'}
                                            onChange={(e) => onUpdateProject({ styles: { ...styles, headerTextColor: e.target.value } })}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Border Radius ({styles.headerBorderRadius || 4}px)</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="20"
                                        value={styles.headerBorderRadius !== undefined ? styles.headerBorderRadius : 4}
                                        onChange={(e) => onUpdateProject({ styles: { ...styles, headerBorderRadius: parseInt(e.target.value) } })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                        )}

                        <h3>Colors</h3>

                        <div className="input-group">
                            <label>Primary Color (Headings)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="color"
                                    value={styles.primaryColor || '#333333'}
                                    onChange={(e) => onUpdateProject({ styles: { ...styles, primaryColor: e.target.value } })}
                                />
                                <input
                                    type="text"
                                    value={styles.primaryColor || '#333333'}
                                    onChange={(e) => onUpdateProject({ styles: { ...styles, primaryColor: e.target.value } })}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Accent Color (Details)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="color"
                                    value={styles.accentColor || '#666666'}
                                    onChange={(e) => onUpdateProject({ styles: { ...styles, accentColor: e.target.value } })}
                                />
                                <input
                                    type="text"
                                    value={styles.accentColor || '#666666'}
                                    onChange={(e) => onUpdateProject({ styles: { ...styles, accentColor: e.target.value } })}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'experience' && (
                    <div className="editor-section">
                        <div className="section-header">
                            <h3>Experience</h3>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button className="add-btn" onClick={importDefaultExperience} title="Import Defaults" style={{ background: '#eee', color: '#333' }}>📥</button>
                                <button className="add-btn" onClick={() => onEditEntry(null)}><Plus size={14} /> Add</button>
                            </div>
                        </div>
                        <div className="list-items">
                            {entries.map((entry, index) => (
                                <div key={entry.id} className="list-item">
                                    <div className="item-order-controls">
                                        <button onClick={() => onReorderEntries(index, -1)} disabled={index === 0}><ArrowUp size={12} /></button>
                                        <button onClick={() => onReorderEntries(index, 1)} disabled={index === entries.length - 1}><ArrowDown size={12} /></button>
                                    </div>
                                    <div className="item-info">
                                        <strong>{entry.company}</strong>
                                        <span>{entry.role}</span>
                                    </div>
                                    <div className="item-actions">
                                        <button onClick={() => onEditEntry(entry)}><Edit2 size={14} /></button>
                                        <button onClick={() => onDeleteEntry(entry.id)} className="delete"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'education' && (
                    <div className="editor-section">
                        <div className="section-header">
                            <h3>Education</h3>
                            <button className="add-btn" onClick={() => setIsAddingEdu(true)}><Plus size={14} /> Add</button>
                        </div>

                        {isAddingEdu && (
                            <div className="add-form">
                                <input placeholder="School" value={newEdu.school} onChange={e => setNewEdu({ ...newEdu, school: e.target.value })} />
                                <input placeholder="Degree" value={newEdu.degree} onChange={e => setNewEdu({ ...newEdu, degree: e.target.value })} />
                                <input placeholder="Year (e.g. 2020 - 2024)" value={newEdu.year} onChange={e => setNewEdu({ ...newEdu, year: e.target.value })} />
                                <input placeholder="Description (Optional)" value={newEdu.description} onChange={e => setNewEdu({ ...newEdu, description: e.target.value })} />
                                <div className="form-actions">
                                    <button onClick={addEducation}>Save</button>
                                    <button onClick={() => setIsAddingEdu(false)} className="cancel">Cancel</button>
                                </div>
                            </div>
                        )}

                        <div className="list-items">
                            {(project.education || []).map((edu, idx) => (
                                <div key={idx} className="list-item">
                                    {editingEduIndex === idx ? (
                                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <input value={editEduData.school} onChange={e => setEditEduData({ ...editEduData, school: e.target.value })} placeholder="School" style={{ width: '100%', boxSizing: 'border-box' }} />
                                            <input value={editEduData.degree} onChange={e => setEditEduData({ ...editEduData, degree: e.target.value })} placeholder="Degree" style={{ width: '100%', boxSizing: 'border-box' }} />

                                            <input value={editEduData.year} onChange={e => setEditEduData({ ...editEduData, year: e.target.value })} placeholder="Year" style={{ width: '100%', boxSizing: 'border-box' }} />
                                            <textarea value={editEduData.description || ''} onChange={e => setEditEduData({ ...editEduData, description: e.target.value })} rows={3} placeholder="Description" style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button onClick={saveEditingEdu} style={{ background: '#e0ffe0', flex: 1, border: 'none', cursor: 'pointer' }}><Check size={14} /></button>
                                                <button onClick={() => setEditingEduIndex(null)} style={{ background: '#eee', flex: 1, border: 'none', cursor: 'pointer' }}><X size={14} /></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="item-order-controls">
                                                <button onClick={() => onReorderEducation(idx, -1)} disabled={idx === 0}><ArrowUp size={12} /></button>
                                                <button onClick={() => onReorderEducation(idx, 1)} disabled={idx === (project.education.length - 1)}><ArrowDown size={12} /></button>
                                            </div>
                                            <div className="item-info">
                                                <strong>{edu.school}</strong>
                                                <span>{edu.degree}</span>
                                            </div>
                                            <div className="item-actions">
                                                <button onClick={() => startEditingEdu(idx, edu)}><Edit2 size={14} /></button>
                                                <button onClick={() => deleteEducation(idx)} className="delete"><Trash2 size={14} /></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'skills' && (
                    <div className="editor-section">
                        <div className="section-header">
                            <h3>Skills</h3>
                            <button className="add-btn" onClick={() => setIsAddingSkill(true)}><Plus size={14} /> Add</button>
                        </div>

                        {isAddingSkill && (
                            <div className="add-form" style={{ display: 'flex', gap: '5px' }}>
                                <input
                                    placeholder="New Skill"
                                    value={newSkill}
                                    onChange={e => setNewSkill(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addSkill()}
                                    style={{ marginBottom: 0 }}
                                />
                                <button onClick={addSkill} style={{ background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><Check size={14} /></button>
                                <button onClick={() => setIsAddingSkill(false)} style={{ background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><X size={14} /></button>
                            </div>
                        )}

                        <div className="list-items">
                            {(project.skills || []).map((skill, idx) => (
                                <div key={idx} className="list-item" style={{ padding: '8px' }}>
                                    <div className="item-order-controls">
                                        <button onClick={() => onReorderSkills(idx, -1)} disabled={idx === 0}><ArrowUp size={12} /></button>
                                        <button onClick={() => onReorderSkills(idx, 1)} disabled={idx === (project.skills.length - 1)}><ArrowDown size={12} /></button>
                                    </div>
                                    <div className="item-info">
                                        <strong>{skill}</strong>
                                    </div>
                                    <div className="item-actions">
                                        <button onClick={() => deleteSkill(idx)} className="delete"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div className="editor-section">
                        <div className="section-header">
                            <h3>Courses</h3>
                            <button className="add-btn" onClick={() => setIsAddingCourse(true)}><Plus size={14} /> Add</button>
                        </div>

                        {/* Display Mode Toggle */}
                        <div className="input-group" style={{ marginBottom: '20px', background: '#eaeaea', padding: '10px', borderRadius: '4px' }}>
                            <label style={{ fontWeight: 'bold' }}>Display Mode</label>
                            <select
                                value={project.courses_display_mode || 'icons'}
                                onChange={(e) => onUpdateProject({ courses_display_mode: e.target.value })}
                                style={{ width: '100%', padding: '6px' }}
                            >
                                <option value="icons">Icons (Grid)</option>
                                <option value="list">List (Text)</option>
                            </select>
                        </div>

                        {isAddingCourse && (
                            <div className="add-form">
                                <input placeholder="Name" value={newCourse.name} onChange={e => setNewCourse({ ...newCourse, name: e.target.value })} />
                                <input placeholder="Year" value={newCourse.year} onChange={e => setNewCourse({ ...newCourse, year: e.target.value })} />
                                <div className="input-group">
                                    <label>Icon/Image</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input placeholder="Or filename" value={newCourse.image} onChange={e => setNewCourse({ ...newCourse, image: e.target.value })} style={{ flex: 1 }} />
                                        <label className="upload-btn">
                                            <Upload size={14} />
                                            <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'image', newCourse, setNewCourse)} disabled={uploading} />
                                        </label>
                                    </div>
                                    {newCourse.image && <small>Image set!</small>}
                                </div>
                                <div className="form-actions">
                                    <button onClick={addCourse}>Save</button>
                                    <button onClick={() => setIsAddingCourse(false)} className="cancel">Cancel</button>
                                </div>
                            </div>
                        )}

                        <div className="list-items">
                            {(project.courses || []).map((course, idx) => (
                                <div key={idx} className="list-item">
                                    {editingCourseIndex === idx ? (
                                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <input value={editCourseData.name} onChange={e => setEditCourseData({ ...editCourseData, name: e.target.value })} placeholder="Name" style={{ width: '100%', boxSizing: 'border-box' }} />
                                            <input value={editCourseData.year} onChange={e => setEditCourseData({ ...editCourseData, year: e.target.value })} placeholder="Year" style={{ width: '100%', boxSizing: 'border-box' }} />
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <input value={editCourseData.image || ''} onChange={e => setEditCourseData({ ...editCourseData, image: e.target.value })} placeholder="Image" style={{ flex: 1 }} />
                                                <label className="upload-btn" style={{ padding: '4px 8px' }}>
                                                    <Upload size={14} />
                                                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'image', editCourseData, setEditCourseData)} disabled={uploading} />
                                                </label>
                                            </div>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button onClick={saveEditingCourse} style={{ background: '#e0ffe0', flex: 1, border: 'none', cursor: 'pointer' }}><Check size={14} /></button>
                                                <button onClick={() => setEditingCourseIndex(null)} style={{ background: '#eee', flex: 1, border: 'none', cursor: 'pointer' }}><X size={14} /></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="item-order-controls">
                                                <button onClick={() => onReorderCourses(idx, -1)} disabled={idx === 0}><ArrowUp size={12} /></button>
                                                <button onClick={() => onReorderCourses(idx, 1)} disabled={idx === (project.courses.length - 1)}><ArrowDown size={12} /></button>
                                            </div>
                                            <div className="item-info">
                                                <strong>{course.name}</strong>
                                                <span>{course.year}</span>
                                            </div>
                                            <div className="item-actions">
                                                <button onClick={() => startEditingCourse(idx, course)}><Edit2 size={14} /></button>
                                                <button onClick={() => deleteCourse(idx)} className="delete"><Trash2 size={14} /></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .editor-sidebar {
                    width: 300px;
                    background: #f8f9fa;
                    border-left: 1px solid #ddd;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    position: fixed;
                    right: 0;
                    top: 0;
                    box-shadow: -2px 0 10px rgba(0,0,0,0.05);
                    z-index: 50;
                }
                .editor-tabs {
                    display: flex;
                    background: #fff;
                    border-bottom: 1px solid #ddd;
                }
                .editor-tabs button {
                    flex: 1;
                    border: none;
                    background: none;
                    padding: 15px 5px;
                    cursor: pointer;
                    font-weight: 500;
                    color: #666;
                    border-bottom: 2px solid transparent;
                }
                .editor-tabs button.active {
                    color: #000;
                    border-bottom-color: #000;
                }
                .editor-content {
                    padding: 20px;
                    overflow-y: auto;
                    flex: 1;
                }
                .editor-section h3 {
                    margin-top: 0;
                    font-size: 1.1em;
                    margin-bottom: 15px;
                    color: #333;
                }
                .item-order-controls {
                    display: flex;
                    flex-direction: column;
                    margin-right: 8px;
                }
                .item-order-controls button {
                    border: none;
                    background: #eee;
                    cursor: pointer;
                    padding: 2px;
                    margin-bottom: 2px;
                    border-radius: 3px;
                }
                .item-order-controls button:hover {
                    background: #ddd;
                }
                .item-order-controls button:disabled {
                    opacity: 0.3;
                    cursor: default;
                }
                
                .input-group { margin-bottom: 15px; }
                .input-group label { display: block; font-size: 0.8em; margin-bottom: 5px; color: #666; }
                .input-group input, .summary-input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9em; }
                .photo-upload { display: flex; align-items: center; gap: 10px; }
                .preview-thumb { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
                .upload-btn { display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 0.85em; background: #eee; padding: 5px 10px; border-radius: 4px; }
                .section-header { display: flex; justifyContent: space-between; alignItems: center; margin-bottom: 15px; }
                .add-btn { display: flex; alignItems: center; gap: 5px; background: #000; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.85em; }
                .list-item { background: #fff; border: 1px solid #eee; padding: 10px; margin-bottom: 8px; border-radius: 4px; display: flex; justifyContent: space-between; alignItems: center; }
                .item-info { display: flex; flexDirection: column; font-size: 0.9em; flex: 1; margin: 0 5px; }
                .item-info span { font-size: 0.8em; color: #888; }
                .item-actions button { background: none; border: none; cursor: pointer; opacity: 0.6; padding: 4px; }
                .item-actions button:hover { opacity: 1; }
                .item-actions button.delete { color: red; }
                .add-form { background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px; }
                .add-form input { display: block; width: 100%; margin-bottom: 8px; padding: 6px; box-sizing: border-box; }
                .form-actions { display: flex; gap: 10px; }
                .form-actions button { flex: 1; padding: 6px; cursor: pointer; }
                .form-actions .cancel { background: #eee; border: none; }
            `}</style>
        </div >
    );
};

export default ProjectEditor;
