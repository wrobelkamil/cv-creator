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

        // Try to fetch profile defaults
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();

        const newProjectData = {
            name: newProjectName,
            user_id: session.user.id,
            // Copy default text fields if they exist
            summary: profile?.summary,
            role: profile?.role,
            full_name: profile?.full_name,
            email: profile?.email,
            phone: profile?.phone,
            location: profile?.location,
            linkedin: profile?.linkedin,
            portfolio: profile?.portfolio,
            photo_url: profile?.photo_url,
            // Arrays (JSONB)
            education: profile?.education,
            courses: profile?.courses
        };

        const { data: projData, error } = await supabase
            .from('projects')
            .insert([newProjectData])
            .select()
            .single();

        if (error) {
            alert("Error creating project: " + error.message);
            return;
        }

        const newProjectId = projData.id;

        // Copy default experience as project_entries
        if (profile?.experience && profile.experience.length > 0) {
            const newEntries = profile.experience.map((entry, index) => ({
                project_id: newProjectId,
                user_id: session.user.id,
                company: entry.company,
                role: entry.role,
                period: entry.period,
                description: entry.description,
                sort_order: index
            }));

            const { error: entriesError } = await supabase
                .from('project_entries')
                .insert(newEntries);

            if (entriesError) console.error("Error copying experience:", entriesError);
        }

        setNewProjectName('');
        navigate(`/project/${newProjectId}`);
    };

    const deleteProject = async (id, e) => {
        e.preventDefault(); // Prevent link navigation
        if (!window.confirm("Are you sure? This will delete the project and all its entries.")) return;

        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) alert("Error deleting: " + error.message);
        else fetchProjects();
    };

    const renameProject = async (project) => {
        const newName = window.prompt("Enter new project name:", project.name);
        if (!newName || newName === project.name) return;

        const { error } = await supabase
            .from('projects')
            .update({ name: newName })
            .eq('id', project.id);

        if (error) alert("Error renaming: " + error.message);
        else fetchProjects();
    };

    const duplicateProject = async (project) => {
        if (!window.confirm(`Duplicate "${project.name}"?`)) return;

        // 1. Create new Project
        const { data: newProjectData, error: projError } = await supabase
            .from('projects')
            .insert([{
                name: `${project.name} (Copy)`,
                user_id: session.user.id,
                summary: project.summary,
                portfolio: project.portfolio,
                role: project.role,
                full_name: project.full_name,
                email: project.email,
                phone: project.phone,
                location: project.location,
                linkedin: project.linkedin,
                photo_url: project.photo_url,
                education: project.education,
                courses: project.courses,
                courses_display_mode: project.courses_display_mode,
                skills: project.skills,
                styles: project.styles,
                custom_contacts: project.custom_contacts
            }])
            .select()
            .single();

        if (projError) {
            alert("Error duplicating project: " + projError.message);
            return;
        }

        const newProjectId = newProjectData.id;

        // 2. Fetch existing entries
        const { data: entries } = await supabase
            .from('project_entries')
            .select('*')
            .eq('project_id', project.id);

        // 3. Insert copied entries
        if (entries && entries.length > 0) {
            const newEntries = entries.map(entry => ({
                project_id: newProjectId,
                user_id: session.user.id,
                company: entry.company,
                role: entry.role,
                period: entry.period,
                description: entry.description,
                sort_order: entry.sort_order
            }));

            const { error: entriesError } = await supabase
                .from('project_entries')
                .insert(newEntries);

            if (entriesError) console.error("Error duplicating entries:", entriesError);
        }

        fetchProjects();
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'Inter, sans-serif' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1>🗂️ My CV Projects</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to="/profile" style={{ textDecoration: 'none' }}>
                        <button style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>
                            ⚙️ Base Data (Settings)
                        </button>
                    </Link>
                    <button onClick={() => supabase.auth.signOut()} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#333', color: 'white', cursor: 'pointer' }}>
                        Logout
                    </button>
                </div>
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
                    <div key={project.id} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: 'transform 0.2s', position: 'relative' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <Link to={`/project/${project.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                                <h3 style={{ marginTop: 0, paddingRight: '10px', marginBottom: '5px' }}>{project.name}</h3>
                            </Link>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => renameProject(project)}
                                    title="Rename"
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', opacity: 0.6 }}
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => duplicateProject(project)}
                                    title="Duplicate"
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', opacity: 0.6 }}
                                >
                                    📑
                                </button>
                                <button
                                    onClick={(e) => deleteProject(project.id, e)}
                                    title="Delete"
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: 'red', opacity: 0.6 }}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>

                        <Link to={`/project/${project.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <p style={{ fontSize: '0.85em', color: '#888', margin: 0 }}>Created: {new Date(project.created_at).toLocaleDateString()}</p>
                            <div style={{ fontSize: '0.8em', background: '#f0f0f0', padding: '5px', borderRadius: '4px', marginTop: '10px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                ID: {project.id}
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {projects.length === 0 && (
                <p style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>No projects yet. Create one above!</p>
            )}
        </div>
    );
};

export default Dashboard;
