
import { supabase } from './supabaseClient';
import React, { useState, useEffect } from 'react';
import CVLayout from './components/CVLayout';
import DataImporter from './components/DataImporter';
import PromptBuilder from './components/PromptBuilder';
import { staticData } from './data/staticData';
import { initialDynamicData } from './data/dynamicData';

function App() {
  const [dynamicData, setDynamicData] = useState(initialDynamicData);
  const [dbExperience, setDbExperience] = useState([]);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const { data, error } = await supabase
          .from('cv_entries')
          .select('*')
          .order('period', { ascending: false });

        if (error) {
          console.log('Supabase fetch error (expected if not set up):', error.message);
          return;
        }

        if (data && data.length > 0) {
          setDbExperience(data);
        }
      } catch (err) {
        console.log("Supabase not configured.");
      }
    };

    fetchExperience();
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
    </div>
  );
}

export default App;
