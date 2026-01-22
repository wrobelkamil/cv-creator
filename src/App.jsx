
import { supabase } from './supabaseClient';
import React, { useState, useEffect } from 'react';
import CVLayout from './components/CVLayout';
import DataImporter from './components/DataImporter';
import PromptBuilder from './components/PromptBuilder';
import AuthModal from './components/AuthModal';
import ExperienceEditor from './components/ExperienceEditor';
import { staticData } from './data/staticData';
import { initialDynamicData } from './data/dynamicData';

function App() {
  const [dynamicData, setDynamicData] = useState(initialDynamicData);
  const [dbExperience, setDbExperience] = useState([]);
  const [session, setSession] = useState(null);

  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      console.warn("Supabase client not initialized. Check .env or Netlify settings.");
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const fetchExperience = async () => {
      try {
        const { data, error } = await supabase
          .from('cv_entries')
          .select('*')
          .order('period', { ascending: false });

        if (error) {
          console.log('Supabase fetch error:', error.message);
        } else if (data) {
          setDbExperience(data);
        }
      } catch (err) {
        console.log("Supabase connection error.");
      }
    };

    fetchExperience();

    // REALTIME SUBSCRIPTION
    const channel = supabase
      .channel('public:cv_entries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cv_entries' }, (payload) => {
        console.log('Realtime change:', payload);
        fetchExperience(); // Refresh data on any change
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const fullData = {
    ...staticData,
    ...dynamicData,
    experience: (dynamicData.experience && dynamicData.experience.length > 0 && dynamicData.experience[0].company !== "Creative Studio XYZ")
      ? dynamicData.experience
      : (dbExperience.length > 0 ? dbExperience : staticData.experience),

    masterExperience: dbExperience.length > 0 ? dbExperience : staticData.masterExperience
  };

  const handleImport = (newData) => {
    setDynamicData(prev => ({ ...prev, ...newData }));
  };

  return (
    <div>
      <CVLayout data={fullData} />

      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        zIndex: 100
      }}
        className="no-print"
      >
        <button
          onClick={() => {
            if (!supabase) {
              alert("Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify.");
              return;
            }
            session ? supabase.auth.signOut() : setIsAuthOpen(true);
          }}
          style={{
            background: session ? '#444' : '#22c55e',
            color: 'white', border: 'none', borderRadius: '50px', width: '60px', height: '60px', fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          title={session ? "Log Out" : "Log In"}
        >
          {session ? '🔓' : '🔑'}
        </button>

        {session && (
          <button
            onClick={() => setIsEditorOpen(true)}
            style={{
              background: '#f59e0b',
              color: 'white', border: 'none', borderRadius: '50px', width: '60px', height: '60px', fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Edit Experience"
          >
            ✏️
          </button>
        )}

        <button
          onClick={() => setIsBuilderOpen(true)}
          style={{
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            width: '60px',
            height: '60px',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          title="Build AI Prompt (Memory)"
        >
          🧠
        </button>

        <button
          onClick={() => setIsImporterOpen(true)}
          style={{
            background: 'black',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            width: '60px',
            height: '60px',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          title="Import JSON"
        >
          ✨
        </button>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      {isBuilderOpen && (
        <PromptBuilder onClose={() => setIsBuilderOpen(false)} />
      )}

      {isImporterOpen && (
        <DataImporter
          onImport={handleImport}
          onClose={() => setIsImporterOpen(false)}
        />
      )}

      {isAuthOpen && (
        <AuthModal onClose={() => setIsAuthOpen(false)} />
      )}

      {isEditorOpen && (
        <ExperienceEditor
          onClose={() => setIsEditorOpen(false)}
        // onSuccess={() => {}} // Covered by realtime subscription
        />
      )}
    </div>
  );
}

export default App;
