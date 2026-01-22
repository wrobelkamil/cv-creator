import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProjectView from './components/ProjectView';
import AuthModal from './components/AuthModal';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    }) || { data: { subscription: { unsubscribe: () => { } } } };

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <Router>
      {!session ? (
        // Force Login if not authenticated
        <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <AuthModal onClose={() => { }} />
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Dashboard session={session} />} />
          <Route path="/project/:projectId" element={<ProjectView session={session} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
