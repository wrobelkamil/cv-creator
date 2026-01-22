
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthModal = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();

        if (!supabase) {
            setMessage("Error: Supabase not configured.");
            return;
        }

        setLoading(true);
        let error;

        if (isSignUp) {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password
            });
            error = signUpError;
            if (!error) setMessage('Account created! Please check your email to confirm specific settings or just log in if disabled.');
        } else {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            error = signInError;
        }

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else if (!isSignUp) {
            // Login successful, modal will close via App.js state change or we can force it
            onClose();
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
                <h2>{isSignUp ? 'Create Account' : 'Login'}</h2>

                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
                    </button>
                </form>

                {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}

                <div style={{ fontSize: '0.9em', color: '#666' }}>
                    {isSignUp ? "Already have an account? " : "Don't have an account? "}
                    <button
                        onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
                        style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                    >
                        {isSignUp ? 'Log In' : 'Sign Up'}
                    </button>
                </div>

                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default AuthModal;
