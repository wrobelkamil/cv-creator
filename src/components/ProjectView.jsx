import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useParams, Link } from 'react-router-dom';
import CVLayout from './CVLayout';
import ExperienceEditor from './ExperienceEditor';
import GenericEditor from './GenericEditor';
import { staticData } from '../data/staticData';

const ProjectView = ({ session }) => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [projectEntries, setProjectEntries] = useState([]);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    // activeField: 'summary' | 'role' | 'portfolio' | null
    const [activeField, setActiveField] = useState(null);
    const [editingEntry, setEditingEntry] = useState(null);

    useEffect(() => {
        fetchProjectData();

        const channel = supabase
            .channel(`project:${projectId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_entries', filter: `project_id=eq.${projectId}` }, (payload) => {
                fetchProjectData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` }, (payload) => {
                fetchProjectData();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [projectId]);

    const fetchProjectData = async () => {
        const { data: projData } = await supabase.from('projects').select('*').eq('id', projectId).single();
        setProject(projData);

        const { data: entriesData } = await supabase
            .from('project_entries')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (entriesData) setProjectEntries(entriesData);
    };

    const deleteEntry = async (id) => {
        if (!window.confirm("Are you sure you want to delete this entry?")) return;

        const { error } = await supabase
            .from('project_entries')
            .delete()
            .eq('id', id);

        if (error) alert("Error deleting: " + error.message);
        else fetchProjectData();
    };

    const [isMoving, setIsMoving] = useState(false);

    const moveEntry = async (index, direction) => {
        if (isMoving) return;
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= projectEntries.length) return;

        setIsMoving(true);

        const itemA = projectEntries[index];
        const itemB = projectEntries[newIndex];

        // Parse timestamps
        let timeA = new Date(itemA.created_at).getTime();
        let timeB = new Date(itemB.created_at).getTime();

        // Swap values
        const temp = timeA;
        timeA = timeB;
        timeB = temp;

        // Handle collision or insufficient precision
        if (timeA === timeB) {
            // We want itemA (at newIndex) to be effectively sorted relative to itemB (at index)
            // Order is DESC (Newer First).
            // If newIndex < index (Moving Up): ItemA is above ItemB. ItemA must be NEWER (Larger Time).
            if (newIndex < index) {
                timeA += 1;
            }
            // If newIndex > index (Moving Down): ItemA is below ItemB. ItemA must be OLDER (Smaller Time).
            else {
                timeA -= 1;
            }
        }

        // Convert back to ISO string
        const newTimeA = new Date(timeA).toISOString();
        const newTimeB = new Date(timeB).toISOString();

        // Optimistic UI update
        const newEntries = [...projectEntries];
        newEntries[index] = itemB;
        newEntries[newIndex] = itemA;
        setProjectEntries(newEntries);

        try {
            await Promise.all([
                supabase
                    .from('project_entries')
                    .update({ created_at: newTimeA })
                    .eq('id', itemA.id),
                supabase
                    .from('project_entries')
                    .update({ created_at: newTimeB })
                    .eq('id', itemB.id)
            ]);

            // Fetch strict fresh data to confirm headers/order
            await fetchProjectData();
        } catch (error) {
            console.error("Reorder failed:", error);
            fetchProjectData(); // Revert on error
        } finally {
            setIsMoving(false);
        }
    };

    if (!project) return <div style={{ padding: '20px' }}>Loading Project...</div>;

    // Construct Data for CVLayout
    const fullData = {
        ...staticData,
        personalInfo: {
            ...staticData.personalInfo,
            role: project.role || staticData.personalInfo.role,
            portfolio: project.portfolio || staticData.personalInfo.portfolio
        },
        summary: project.summary || staticData.summary,
        experience: projectEntries.length > 0 ? projectEntries : [],
        masterExperience: projectEntries,
    };

    const copyToken = () => {
        navigator.clipboard.writeText(projectId);
        alert("Project Token copied! Paste this into ChatGPT.");
    };

    return (
        <div>
            {/* Project Header Bar (No Print) */}
            <div className="no-print" style={{
                background: '#333', color: 'white', padding: '10px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Link to="/" style={{ color: '#aaa', textDecoration: 'none' }}>← Dashboard</Link>
                    <span style={{ fontWeight: 'bold' }}>{project.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.8em', color: '#aaa' }}>Project Token:</span>
                    <code style={{ background: '#222', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>{projectId}</code>
                    <button onClick={copyToken} style={{ cursor: 'pointer', fontSize: '0.8em' }}>📋</button>
                </div>
            </div>

            <CVLayout
                data={fullData}
                isEditable={true}
                onEdit={(entry) => {
                    if (['summary', 'role', 'portfolio'].includes(entry.role)) {
                        setActiveField(entry.role);
                    } else {
                        setEditingEntry(entry);
                        setIsEditorOpen(true);
                    }
                }}
                onDelete={deleteEntry}
                onMove={moveEntry}
            />

            {/* Floating Buttons */}
            <div className="no-print" style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 100 }}>
                <button
                    onClick={() => { setEditingEntry(null); setIsEditorOpen(true); }}
                    style={{
                        background: '#f59e0b', color: 'white', border: 'none', borderRadius: '50px',
                        width: '60px', height: '60px', fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}
                    title="Add Entry Manually"
                >
                    ✏️
                </button>
            </div>

            <style>{`@media print { .no-print { display: none !important; } }`}</style>

            {isEditorOpen && (
                <ExperienceEditor
                    projectId={projectId}
                    initialData={editingEntry}
                    onClose={() => { setIsEditorOpen(false); setEditingEntry(null); }}
                    onSuccess={() => fetchProjectData()}
                />
            )}

            {activeField && (
                <GenericEditor
                    projectId={projectId}
                    field={activeField}
                    label={activeField}
                    initialValue={
                        activeField === 'summary' ? (project.summary || staticData.summary) :
                            activeField === 'role' ? (project.role || staticData.personalInfo.role) :
                                activeField === 'portfolio' ? (project.portfolio || staticData.personalInfo.portfolio) : ''
                    }
                    onClose={() => setActiveField(null)}
                    onSuccess={() => fetchProjectData()}
                />
            )}
        </div>
    );
};

export default ProjectView;
