import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const GenericEditor = ({ projectId, initialValue, field, label, onClose, onSuccess }) => {
    const [value, setValue] = useState(initialValue || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('projects')
            .update({ [field]: value })
            .eq('id', projectId);

        setLoading(false);
        if (error) {
            alert(`Error updating ${label}: ` + error.message);
        } else {
            onSuccess();
            onClose();
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '500px', maxWidth: '95%' }}>
                <h3 style={{ textTransform: 'capitalize' }}>Edit {label}</h3>
                {field === 'summary' ? (
                    <textarea
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        style={{ width: '100%', height: '150px', padding: '10px', marginBottom: '15px', fontFamily: 'inherit' }}
                        placeholder={`Enter ${label}...`}
                    />
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px' }}
                        placeholder={`Enter ${label}...`}
                    />
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', cursor: 'pointer' }}>Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        style={{ padding: '8px 16px', background: 'black', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GenericEditor;
