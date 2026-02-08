import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, Plus, Trash2, Edit2, ArrowUp, ArrowDown, Save, X, Check } from 'lucide-react';
import { staticData } from '../data/staticData';

const ProfilePage = ({ session }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({});
    const [activeTab, setActiveTab] = useState('personal');
    const [uploading, setUploading] = useState(false);

    // Helpers for form state
    const [isAddingEdu, setIsAddingEdu] = useState(false);
    const [newEdu, setNewEdu] = useState({ school: '', degree: '', year: '', description: '' });
    const [editingEduIndex, setEditingEduIndex] = useState(null);
    const [editEduData, setEditEduData] = useState({});

    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [newCourse, setNewCourse] = useState({ name: '', year: '', image: '' });
    const [editingCourseIndex, setEditingCourseIndex] = useState(null);
    const [editCourseData, setEditCourseData] = useState({});

    const [isAddingExp, setIsAddingExp] = useState(false);
    const [newExp, setNewExp] = useState({ company: '', role: '', period: '', description: '' });
    const [editingExpIndex, setEditingExpIndex] = useState(null);
    const [editExpData, setEditExpData] = useState({});

    useEffect(() => {
        fetchProfile();
    }, [session]);

    const fetchProfile = async () => {
        if (!session?.user) return;
        const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();

        if (data) {
            setProfile(data);
        } else {
            // Init empty
            setProfile({ id: session.user.id });
        }
        setLoading(false);
    };

    const handleSave = async () => {
        try {
            const updates = {
                ...profile,
                updated_at: new Date(),
            };
            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;
            alert('Settings Saved Successfully!');
        } catch (error) {
            alert('Error saving: ' + error.message);
        }
    };

    const loadStaticDefaults = () => {
        if (!window.confirm("This will overwrite your current settings with the original system defaults. Continue?")) return;

        const defaults = {
            full_name: staticData.personalInfo.fullName,
            role: staticData.personalInfo.role,
            email: staticData.personalInfo.email,
            phone: staticData.personalInfo.phone,
            location: staticData.personalInfo.location,
            linkedin: staticData.personalInfo.linkedin,
            portfolio: staticData.personalInfo.portfolio,
            photo_url: staticData.personalInfo.photoUrl,
            summary: staticData.summary,
            education: staticData.education,
            courses: staticData.courses,
            experience: staticData.masterExperience, // Use master experience
            skills: staticData.skills,
            languages: staticData.languages
        };

        setProfile(prev => ({ ...prev, ...defaults }));
    };

    // --- Generic Handlers ---
    const updateField = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = async (event, field, targetObj = null, setTargetObj = null) => {
        try {
            setUploading(true);
            const file = event.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `profile-${Math.random()}.${fileExt}`;
            let bucket = 'cv-photos';
            const { error } = await supabase.storage.from(bucket).upload(fileName, file);
            if (error) throw error;
            const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

            if (setTargetObj && targetObj) {
                setTargetObj({ ...targetObj, [field]: data.publicUrl });
            } else {
                updateField(field, data.publicUrl);
            }
        } catch (error) {
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    // --- Array Manipulators ---
    const addItem = (field, item, closeFn, resetFn) => {
        const current = profile[field] || [];
        updateField(field, [...current, item]);
        closeFn(false);
        resetFn();
    };

    const deleteItem = (field, index) => {
        if (!window.confirm("Delete this item?")) return;
        const current = profile[field] || [];
        updateField(field, current.filter((_, i) => i !== index));
    };

    const moveItem = (field, index, direction) => {
        const current = [...(profile[field] || [])];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= current.length) return;

        const [moved] = current.splice(index, 1);
        current.splice(newIndex, 0, moved);
        updateField(field, current);
    };

    const startEditing = (index, item, setIndexFn, setDataFn) => {
        setIndexFn(index);
        setDataFn(item);
    };

    const saveEditing = (field, index, data, setIndexFn) => {
        const current = [...(profile[field] || [])];
        current[index] = data;
        updateField(field, current);
        setIndexFn(null);
    };

    if (loading) return <div style={{ padding: 20 }}>Loading settings...</div>;

    return (
        <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: '#666' }}>← Back to Dashboard</Link>
                    <h1>⚙️ Base Data Settings</h1>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={loadStaticDefaults} style={{ padding: '8px 16px', border: '1px solid #eee', background: 'white', color: '#666', borderRadius: '4px', cursor: 'pointer' }}>
                        Reset to Defaults
                    </button>
                    <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 20px', background: 'black', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '30px' }}>
                {/* Sidebar Navigation */}
                <div style={{ width: '200px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {['personal', 'experience', 'education', 'courses'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    textAlign: 'left',
                                    padding: '10px 15px',
                                    background: activeTab === tab ? '#f0f0f0' : 'transparent',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: activeTab === tab ? 'bold' : 'normal',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, background: '#fff', minHeight: '500px' }}>

                    {activeTab === 'personal' && (
                        <div className="section-form">
                            <h2>Personal Information</h2>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input value={profile.full_name || ''} onChange={e => updateField('full_name', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Job Title</label>
                                    <input value={profile.role || ''} onChange={e => updateField('role', e.target.value)} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Summary</label>
                                <textarea rows={4} value={profile.summary || ''} onChange={e => updateField('summary', e.target.value)} />
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input value={profile.email || ''} onChange={e => updateField('email', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input value={profile.phone || ''} onChange={e => updateField('phone', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input value={profile.location || ''} onChange={e => updateField('location', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>LinkedIn</label>
                                    <input value={profile.linkedin || ''} onChange={e => updateField('linkedin', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Portfolio</label>
                                    <input value={profile.portfolio || ''} onChange={e => updateField('portfolio', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Photo</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {profile.photo_url && <img src={profile.photo_url} style={{ width: 40, height: 40, borderRadius: '50%' }} />}
                                        <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'photo_url')} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'experience' && (
                        <div>
                            <div className="tab-header">
                                <h2>Default Experience</h2>
                                <button className="add-btn" onClick={() => setIsAddingExp(true)}><Plus size={14} /> Add</button>
                            </div>

                            {isAddingExp && (
                                <div className="add-card">
                                    <input placeholder="Company" value={newExp.company} onChange={e => setNewExp({ ...newExp, company: e.target.value })} />
                                    <input placeholder="Role" value={newExp.role} onChange={e => setNewExp({ ...newExp, role: e.target.value })} />
                                    <input placeholder="Period" value={newExp.period} onChange={e => setNewExp({ ...newExp, period: e.target.value })} />
                                    <textarea placeholder="Description" rows={3} value={newExp.description} onChange={e => setNewExp({ ...newExp, description: e.target.value })} />
                                    <div className="actions">
                                        <button onClick={() => addItem('experience', newExp, setIsAddingExp, () => setNewExp({ company: '', role: '', period: '', description: '' }))}>Add</button>
                                        <button onClick={() => setIsAddingExp(false)}>Cancel</button>
                                    </div>
                                </div>
                            )}

                            {(profile.experience || []).map((item, i) => (
                                <div key={i} className="list-card">
                                    {editingExpIndex === i ? (
                                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <input value={editExpData.company} onChange={e => setEditExpData({ ...editExpData, company: e.target.value })} placeholder="Company" />
                                            <input value={editExpData.role} onChange={e => setEditExpData({ ...editExpData, role: e.target.value })} placeholder="Role" />
                                            <input value={editExpData.period} onChange={e => setEditExpData({ ...editExpData, period: e.target.value })} placeholder="Period" />
                                            <textarea value={editExpData.description} onChange={e => setEditExpData({ ...editExpData, description: e.target.value })} rows={3} placeholder="Description" />
                                            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                                <button onClick={() => saveEditing('experience', i, editExpData, setEditingExpIndex)} className="save-btn"><Check size={14} /> Save</button>
                                                <button onClick={() => setEditingExpIndex(null)} className="cancel-btn"><X size={14} /> Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="content">
                                                <strong>{item.role}</strong> at {item.company}
                                                <div className="meta">{item.period}</div>
                                            </div>
                                            <div className="controls">
                                                <button onClick={() => startEditing(i, item, setEditingExpIndex, setEditExpData)} title="Edit"><Edit2 size={14} /></button>
                                                <button onClick={() => moveItem('experience', i, -1)} disabled={i === 0}><ArrowUp size={14} /></button>
                                                <button onClick={() => moveItem('experience', i, 1)} disabled={i === (profile.experience.length - 1)}><ArrowDown size={14} /></button>
                                                <button onClick={() => deleteItem('experience', i)} className="del"><Trash2 size={14} /></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'education' && (
                        <div>
                            <div className="tab-header">
                                <h2>Default Education</h2>
                                <button className="add-btn" onClick={() => setIsAddingEdu(true)}><Plus size={14} /> Add</button>
                            </div>

                            {isAddingEdu && (
                                <div className="add-card">
                                    <input placeholder="School" value={newEdu.school} onChange={e => setNewEdu({ ...newEdu, school: e.target.value })} />
                                    <input placeholder="Degree" value={newEdu.degree} onChange={e => setNewEdu({ ...newEdu, degree: e.target.value })} />
                                    <input placeholder="Year" value={newEdu.year} onChange={e => setNewEdu({ ...newEdu, year: e.target.value })} />
                                    <textarea placeholder="Description" rows={3} value={newEdu.description} onChange={e => setNewEdu({ ...newEdu, description: e.target.value })} />
                                    <div className="actions">
                                        <button onClick={() => addItem('education', newEdu, setIsAddingEdu, () => setNewEdu({ school: '', degree: '', year: '', description: '' }))}>Add</button>
                                        <button onClick={() => setIsAddingEdu(false)}>Cancel</button>
                                    </div>
                                </div>
                            )}

                            {(profile.education || []).map((item, i) => (
                                <div key={i} className="list-card">
                                    {editingEduIndex === i ? (
                                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <input value={editEduData.school} onChange={e => setEditEduData({ ...editEduData, school: e.target.value })} placeholder="School" />
                                            <input value={editEduData.degree} onChange={e => setEditEduData({ ...editEduData, degree: e.target.value })} placeholder="Degree" />
                                            <input value={editEduData.year} onChange={e => setEditEduData({ ...editEduData, year: e.target.value })} placeholder="Year" />
                                            <textarea value={editEduData.description || ''} onChange={e => setEditEduData({ ...editEduData, description: e.target.value })} rows={3} placeholder="Description" />
                                            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                                <button onClick={() => saveEditing('education', i, editEduData, setEditingEduIndex)} className="save-btn"><Check size={14} /> Save</button>
                                                <button onClick={() => setEditingEduIndex(null)} className="cancel-btn"><X size={14} /> Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="content">
                                                <strong>{item.school}</strong>
                                                <div>{item.degree}</div>
                                                <div className="meta">{item.year}</div>
                                            </div>
                                            <div className="controls">
                                                <button onClick={() => startEditing(i, item, setEditingEduIndex, setEditEduData)} title="Edit"><Edit2 size={14} /></button>
                                                <button onClick={() => moveItem('education', i, -1)} disabled={i === 0}><ArrowUp size={14} /></button>
                                                <button onClick={() => moveItem('education', i, 1)} disabled={i === (profile.education.length - 1)}><ArrowDown size={14} /></button>
                                                <button onClick={() => deleteItem('education', i)} className="del"><Trash2 size={14} /></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'courses' && (
                        <div>
                            <div className="tab-header">
                                <h2>Default Courses</h2>
                                <button className="add-btn" onClick={() => setIsAddingCourse(true)}><Plus size={14} /> Add</button>
                            </div>

                            {isAddingCourse && (
                                <div className="add-card">
                                    <input placeholder="Name" value={newCourse.name} onChange={e => setNewCourse({ ...newCourse, name: e.target.value })} />
                                    <input placeholder="Year" value={newCourse.year} onChange={e => setNewCourse({ ...newCourse, year: e.target.value })} />
                                    <input placeholder="Image" value={newCourse.image} onChange={e => setNewCourse({ ...newCourse, image: e.target.value })} />
                                    <div className="actions">
                                        <button onClick={() => addItem('courses', newCourse, setIsAddingCourse, () => setNewCourse({ name: '', year: '', image: '' }))}>Add</button>
                                        <button onClick={() => setIsAddingCourse(false)}>Cancel</button>
                                    </div>
                                </div>
                            )}

                            {(profile.courses || []).map((item, i) => (
                                <div key={i} className="list-card">
                                    {editingCourseIndex === i ? (
                                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <input value={editCourseData.name} onChange={e => setEditCourseData({ ...editCourseData, name: e.target.value })} placeholder="Name" />
                                            <input value={editCourseData.year} onChange={e => setEditCourseData({ ...editCourseData, year: e.target.value })} placeholder="Year" />
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <input value={editCourseData.image || ''} onChange={e => setEditCourseData({ ...editCourseData, image: e.target.value })} placeholder="Image URL" style={{ flex: 1 }} />
                                                <label className="save-btn" style={{ cursor: 'pointer', padding: '0 8px', display: 'flex', alignItems: 'center', background: '#eee', color: '#333' }}>
                                                    <Upload size={14} />
                                                    <input type="file" hidden accept="image/*" onChange={e => handleFileUpload(e, 'image', editCourseData, setEditCourseData)} />
                                                </label>
                                            </div>
                                            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                                <button onClick={() => saveEditing('courses', i, editCourseData, setEditingCourseIndex)} className="save-btn"><Check size={14} /> Save</button>
                                                <button onClick={() => setEditingCourseIndex(null)} className="cancel-btn"><X size={14} /> Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="content">
                                                <strong>{item.name}</strong>
                                                <div className="meta">{item.year}</div>
                                            </div>
                                            <div className="controls">
                                                <button onClick={() => startEditing(i, item, setEditingCourseIndex, setEditCourseData)} title="Edit"><Edit2 size={14} /></button>
                                                <button onClick={() => moveItem('courses', i, -1)} disabled={i === 0}><ArrowUp size={14} /></button>
                                                <button onClick={() => moveItem('courses', i, 1)} disabled={i === (profile.courses.length - 1)}><ArrowDown size={14} /></button>
                                                <button onClick={() => deleteItem('courses', i)} className="del"><Trash2 size={14} /></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 0.9em; color: #555; }
                .form-group input, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
                
                .tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .add-btn { background: #000; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 5px; }
                
                .add-card { background: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; }
                .add-card .actions { display: flex; gap: 10px; }
                .add-card .actions button { padding: 5px 15px; cursor: pointer; }

                .list-card { display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid #eee; border-radius: 6px; margin-bottom: 10px; background: #fff; }
                .list-card .meta { color: #888; font-size: 0.85em; margin-top: 2px; }
                .controls { display: flex; gap: 5px; }
                .controls button { border: none; background: #f0f0f0; padding: 5px; border-radius: 4px; cursor: pointer; color: #555; }
                .controls button.del { color: red; background: #fff1f1; }
                .controls button:disabled { opacity: 0.3; }

                .save-btn { background: #e0ffe0 !important; color: green !important; }
                .cancel-btn { background: #f0f0f0 !important; color: #666 !important; }
            `}</style>
        </div>
    );
};

export default ProfilePage;
