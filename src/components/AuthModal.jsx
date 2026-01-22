import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthModal = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ email });

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage('Magic link sent to your email!');
        }
        setLoading(false);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1200, fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                background: 'white', padding: '40px', borderRadius: '12px', width: '400px',
                display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center'
            }}>
                <h2>Login / Sign Up</h2>
                <p>Enter your email to receive a Magic Link to log in.</p>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px', background: 'black', color: 'white',
                            border: 'none', borderRadius: '6px', cursor: loading ? 'wait' : 'pointer', fontWeight: '600'
                        }}
                    >
                        {loading ? 'Sending...' : 'Send Magic Link'}
                    </button>
                </form>

                {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}

                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default AuthModal;
