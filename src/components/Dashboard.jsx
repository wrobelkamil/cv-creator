import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = ({ session }) => {
    const [projects, setProjects] = useState([]);
    const [newProjectName, setNewProjectName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, [session]);

    const fetchProjects = async () => {
        if (!session) return;
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setProjects(data);
    };

    const createProject = async () => {
        if (!newProjectName.trim()) return;

        const { data, error } = await supabase
            .from('projects')
            .insert([{ name: newProjectName, user_id: session.user.id }])
            .select();

        if (error) {
            alert("Error creating project: " + error.message);
        } else {
            setNewProjectName('');
            // Navigate automatically to the new project
            navigate(`/project/${data[0].id}`);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'Inter, sans-serif' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1>🗂️ My CV Projects</h1>
                <button onClick={() => supabase.auth.signOut()} style={{ padding: '8px 16px' }}>Logout</button>
            </header>

            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="New Project Name (e.g. Google Application)"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
                <button
                    onClick={createProject}
                    style={{ padding: '0 25px', background: 'black', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Create
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {projects.map(project => (
                    <Link to={`/project/${project.id}`} key={project.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
                            <h3 style={{ marginTop: 0 }}>{project.name}</h3>
                            <p style={{ fontSize: '0.85em', color: '#888' }}>Created: {new Date(project.created_at).toLocaleDateString()}</p>
                            <div style={{ fontSize: '0.8em', background: '#f0f0f0', padding: '5px', borderRadius: '4px', marginTop: '10px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                ID: {project.id}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {projects.length === 0 && (
                <p style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>No projects yet. Create one above!</p>
            )}
        </div>
    );
};

export default Dashboard;
