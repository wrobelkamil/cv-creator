import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Upload } from 'lucide-react';

const ProfileEditor = ({ onClose }) => {
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (data) setProfile(data);
            else {
                // strict mode might fail if row doesn't exist, insert one?
                // Or just init empty state and upsert on save.
                setProfile({ id: user.id });
            }
        }
        setLoading(false);
    };

    const handleSave = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const updates = {
            id: user.id,
            ...profile,
            updated_at: new Date(), // if col exists
        };

        const { error } = await supabase.from('profiles').upsert(updates);
        if (error) alert('Error saving profile: ' + error.message);
        else {
            alert('Profile saved!');
            onClose();
        }
    };

    const handleFileUpload = async (event) => {
        try {
            setUploading(true);
            const file = event.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `profile-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            let bucket = 'cv-photos';
            const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
            setProfile(prev => ({ ...prev, photo_url: data.publicUrl }));

        } catch (error) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <h2>Edit Base Data (Defaults)</h2>
                <p style={{ fontSize: '0.9em', color: '#666' }}>These details will be used for new projects or when fields are empty.</p>

                <div className="form-group">
                    <label>Full Name</label>
                    <input value={profile.full_name || ''} onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Job Title / Role</label>
                    <input value={profile.role || ''} onChange={e => setProfile({ ...profile, role: e.target.value })} />
                </div>

                <div className="form-group">
                    <label>Profile Photo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {profile.photo_url && <img src={profile.photo_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />}
                        <label style={{ cursor: 'pointer', color: 'blue', fontSize: '0.9em' }}>
                            {uploading ? 'Uploading...' : 'Upload Photo'}
                            <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                        </label>
                    </div>
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input value={profile.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Phone</label>
                    <input value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Location</label>
                    <input value={profile.location || ''} onChange={e => setProfile({ ...profile, location: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>LinkedIn</label>
                    <input value={profile.linkedin || ''} onChange={e => setProfile({ ...profile, linkedin: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Portfolio</label>
                    <input value={profile.portfolio || ''} onChange={e => setProfile({ ...profile, portfolio: e.target.value })} />
                </div>

                <div className="form-group">
                    <label>Summary Default</label>
                    <textarea rows={4} value={profile.summary || ''} onChange={e => setProfile({ ...profile, summary: e.target.value })} />
                </div>

                <div className="modal-actions">
                    <button onClick={handleSave} className="primary-btn">Save Defaults</button>
                    <button onClick={onClose} className="secondary-btn">Close</button>
                </div>
            </div>
            <style>{`
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; font-size: 0.85em; margin-bottom: 5px; color: #555; }
                .form-group input, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
                .primary-btn { background: #000; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
                .secondary-btn { background: #eee; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
            `}</style>
        </div>
    );
};

export default ProfileEditor;
