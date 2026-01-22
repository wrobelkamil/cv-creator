import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ExperienceEditor = ({ onClose, onSuccess, projectId, initialData = null }) => {
    const [formData, setFormData] = useState({
        company: '',
        role: '',
        period: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                company: initialData.company || '',
                role: initialData.role || '',
                period: initialData.period || '',
                description: initialData.description || ''
            });
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("You must be logged in to save.");
            setLoading(false);
            return;
        }

        if (!projectId) {
            alert("Error: No Project ID context.");
            setLoading(false);
            return;
        }

        let error;
        if (initialData && initialData.id) {
            // UPDATE existing
            const { error: updateError } = await supabase
                .from('project_entries')
                .update({ ...formData })
                .eq('id', initialData.id)
                .eq('project_id', projectId); // Safety check
            error = updateError;
        } else {
            // INSERT new
            const { error: insertError } = await supabase
                .from('project_entries')
                .insert([{ ...formData, user_id: user.id, project_id: projectId }]);
            error = insertError;
        }

        if (error) {
            alert('Error saving: ' + error.message);
        } else {
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
                <h2>{initialData ? 'Edit Experience' : 'Add Experience'}</h2>
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
                    placeholder="Description (Optional - GPT can fill this)"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', height: '150px', fontFamily: 'inherit' }}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        background: 'black', color: 'white', padding: '12px', border: 'none',
                        borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer'
                    }}
                >
                    {loading ? 'Saving...' : (initialData ? 'Update Entry' : 'Add Entry')}
                </button>
            </form>
        </div>
    );
};

export default ExperienceEditor;
