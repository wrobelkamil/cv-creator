import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const ExperienceEditor = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        company: '',
        role: '',
        period: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("You must be logged in to save.");
            setLoading(false);
            return;
        }

        const { error } = await supabase
            .from('cv_entries')
            .insert([
                {
                    ...formData,
                    user_id: user.id
                }
            ]);

        if (error) {
            alert('Error saving: ' + error.message);
        } else {
            // Reset form or close
            setFormData({ company: '', role: '', period: '', description: '' });
            if (onSuccess) onSuccess();
            onClose();
        }
        setLoading(false);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px',
            background: 'white', borderLeft: '1px solid #ddd', padding: '20px',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.1)', zIndex: 1100,
            display: 'flex', flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Add Experience</h2>
                <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    placeholder="Company Name"
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                    required
                />
                <input
                    placeholder="Role / Position"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                    required
                />
                <input
                    placeholder="Period (e.g. 2023 - Present)"
                    value={formData.period}
                    onChange={e => setFormData({ ...formData, period: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                    required
                />
                <textarea
                    placeholder="Description (Bullet points...)"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', height: '150px', fontFamily: 'inherit' }}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        background: 'black', color: 'white', padding: '12px', border: 'none',
                        borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer'
                    }}
                >
                    {loading ? 'Saving...' : 'Add to CV'}
                </button>
            </form>
        </div>
    );
};

export default ExperienceEditor;
