import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useParams, Link } from 'react-router-dom';
import CVLayout from './CVLayout';
import ExperienceEditor from './ExperienceEditor';
import ProjectEditor from './ProjectEditor'; // New Sidebar
import { staticData } from '../data/staticData';
import html2pdf from 'html2pdf.js';

const ProjectView = ({ session }) => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [projectEntries, setProjectEntries] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // For editing experience items via the modal
    const [editingEntry, setEditingEntry] = useState(null);

    const [isMoving, setIsMoving] = useState(false);

    useEffect(() => {
        fetchProjectData();
        fetchUserProfile();

        const channel = supabase
            .channel(`project:${projectId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_entries', filter: `project_id=eq.${projectId}` }, () => fetchProjectData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` }, () => fetchProjectData())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [projectId]);

    const fetchUserProfile = async () => {
        if (!session?.user) return;
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (data) setUserProfile(data);
    };

    const fetchProjectData = async () => {
        const { data: projData } = await supabase.from('projects').select('*').eq('id', projectId).single();
        const { data: entriesData } = await supabase
            .from('project_entries')
            .select('*')
            .eq('project_id', projectId)
            .order('sort_order', { ascending: true }) // Sort by sort_order first
            .order('created_at', { ascending: false }); // Fallback to created_at

        setProject(projData);
        if (entriesData) setProjectEntries(entriesData);
    };

    const updateProject = async (updates) => {
        // Optimistic update
        setProject(prev => ({ ...prev, ...updates }));

        const { error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', projectId);

        if (error) {
            console.error("Update failed", error);
            fetchProjectData(); // Revert
        }
    };

    // Reorder Education (Array in JSONB)
    const reorderEducation = (fromIndex, direction) => {
        if (!project?.education) return;
        const toIndex = fromIndex + direction;
        if (toIndex < 0 || toIndex >= project.education.length) return;

        const newEdu = [...project.education];
        const [movedItem] = newEdu.splice(fromIndex, 1);
        newEdu.splice(toIndex, 0, movedItem);

        updateProject({ education: newEdu });
    };

    // Reorder Courses (Array in JSONB)
    const reorderCourses = (fromIndex, direction) => {
        if (!project?.courses) return;
        const toIndex = fromIndex + direction;
        if (toIndex < 0 || toIndex >= project.courses.length) return;

        const newCourses = [...project.courses];
        const [movedItem] = newCourses.splice(fromIndex, 1);
        newCourses.splice(toIndex, 0, movedItem);

        updateProject({ courses: newCourses });
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

    const moveEntry = async (index, direction) => {
        if (isMoving) return;
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= projectEntries.length) return;

        setIsMoving(true);

        const itemA = projectEntries[index];
        const itemB = projectEntries[newIndex];

        // Swap sort_order
        // If sort_order is null, we might need to initialize it.
        // Assuming sort_order exists for now or we use logic to swap their "order" field.
        // The simplest way for SQL sort_order is to just swap the values.

        // Let's rely on swapping the actual rows' sort_order values.
        // But first, we need to ensure they HAVE sort_order.
        // If not, we might need to assign them based on index.

        let orderA = itemA.sort_order ?? index;
        let orderB = itemB.sort_order ?? newIndex;

        if (orderA === orderB) {
            // Collision or uninitialized, force spread
            orderA = index * 10;
            orderB = newIndex * 10;
        }

        // Optimistic
        const newEntries = [...projectEntries];
        newEntries[index] = { ...itemB, sort_order: orderA };
        newEntries[newIndex] = { ...itemA, sort_order: orderB }; // Swap positions visually
        setProjectEntries(newEntries);

        try {
            await Promise.all([
                supabase.from('project_entries').update({ sort_order: orderB }).eq('id', itemA.id), // A takes B's place
                supabase.from('project_entries').update({ sort_order: orderA }).eq('id', itemB.id)  // B takes A's place
            ]);
            await fetchProjectData();
        } catch (error) {
            console.error("Reorder failed:", error);
            fetchProjectData();
        } finally {
            setIsMoving(false);
        }
    };

    const handleDownloadPDF = () => {
        setIsDownloading(true);
        const element = document.querySelector('.cv-container');

        // Construct filename: CV_[FirstName]_[ProjectName]
        const firstName = project.full_name?.split(' ')[0] || 'Draft';
        const sanitizedProjectName = project.name?.replace(/\s+/g, '_') || 'Project';
        const fileName = `CV_${firstName}_${sanitizedProjectName}.pdf`;

        const opt = {
            margin: 0,
            filename: fileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                scrollY: 0,
                windowHeight: element.scrollHeight // Capture full height
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Temporarily hide "no-print" elements
        const noPrintEls = document.querySelectorAll('.no-print');
        noPrintEls.forEach(el => el.style.display = 'none');

        // Force single page height to avoid overflow bleed causing blank page
        const originalHeight = element.style.height;
        const originalOverflow = element.style.overflow;

        // Lock to A4 height (minus a tiny bit to be safe from rounding errors)
        element.style.height = '296.8mm';
        element.style.overflow = 'hidden';

        html2pdf().set(opt).from(element).save().then(() => {
            noPrintEls.forEach(el => el.style.display = '');
            element.style.height = originalHeight || ''; // Restore
            element.style.overflow = originalOverflow || ''; // Restore
            setIsDownloading(false);
        }).catch(err => {
            console.error("PDF generation failed:", err);
            noPrintEls.forEach(el => el.style.display = '');
            element.style.height = originalHeight || ''; // Restore
            element.style.overflow = originalOverflow || ''; // Restore
            setIsDownloading(false);
            alert("Could not generate PDF. Please try again.");
        });
    };

    if (!project) return <div style={{ padding: '20px' }}>Loading...</div>;

    // Construct Data using Fallbacks: Project -> Profile -> Static
    // Helper to get fallback
    const getVal = (field, subField = null) => {
        // Map personalInfo fields to project columns
        const fieldMap = {
            fullName: 'full_name',
            role: 'role',
            email: 'email',
            phone: 'phone',
            location: 'location',
            linkedin: 'linkedin',
            portfolio: 'portfolio',
            photoUrl: 'photo_url'
        };

        // 1. Project-specific value
        if (field === 'personalInfo' && subField) {
            const projectKey = fieldMap[subField] || subField;
            if (project[projectKey]) return project[projectKey];
        } else if (subField) {
            if (project[field] && project[field][subField]) return project[field][subField];
        } else {
            if (project[field]) return project[field];
        }

        // 2. User Profile default
        if (userProfile) {
            // Mapping profile fields to project fields
            // Profile has flat structure: full_name, email, etc.
            if (field === 'personalInfo') {
                if (subField === 'fullName') return userProfile.full_name;
                if (subField === 'role') return userProfile.role;
                if (subField === 'email') return userProfile.email;
                if (subField === 'phone') return userProfile.phone;
                if (subField === 'location') return userProfile.location;
                if (subField === 'linkedin') return userProfile.linkedin;
                if (subField === 'portfolio') return userProfile.portfolio;
                if (subField === 'photoUrl') return userProfile.photo_url;
            }
            if (field === 'summary') return userProfile.summary;

            // Arrays
            if (field === 'education' && userProfile.education && userProfile.education.length > 0) return userProfile.education;
            if (field === 'courses' && userProfile.courses && userProfile.courses.length > 0) return userProfile.courses;
        }

        // 3. Static Data (last resort)
        if (subField) return staticData[field]?.[subField];
        return staticData[field];
    };

    const fullData = {
        personalInfo: {
            fullName: getVal('personalInfo', 'fullName'),
            role: getVal('personalInfo', 'role'),
            email: getVal('personalInfo', 'email'),
            phone: getVal('personalInfo', 'phone'),
            location: getVal('personalInfo', 'location'),
            linkedin: getVal('personalInfo', 'linkedin'),
            portfolio: getVal('personalInfo', 'portfolio'),
            photoUrl: getVal('personalInfo', 'photoUrl')
        },
        summary: getVal('summary'),
        experience: projectEntries, // Experience is always project specific
        education: project.education && project.education.length > 0 ? project.education : (userProfile?.education || staticData.education),
        skills: staticData.skills,
        languages: staticData.languages,
        courses: project.courses && project.courses.length > 0 ? project.courses : (userProfile?.courses || staticData.courses),
        coursesDisplayMode: project.courses_display_mode || 'icons'
    };

    const copyToken = () => {
        navigator.clipboard.writeText(projectId);
        alert("Project Token copied!");
    };

    return (
        <div style={{ display: 'flex' }}>
            {/* Main Content Area */}
            <div style={{ flexGrow: 1, paddingRight: '300px' }}> {/* Space for Sidebar */}

                {/* Header Bar */}
                <div className="no-print" style={{
                    background: '#333', color: 'white', padding: '10px 20px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Link to="/" style={{ color: '#aaa', textDecoration: 'none' }}>← Dashboard</Link>
                        <span style={{ fontWeight: 'bold' }}>{project.name}</span>
                        {userProfile && <span style={{ fontSize: '0.8em', color: '#8f8' }}>✓ Profile Loaded</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button onClick={handleDownloadPDF} disabled={isDownloading} style={{ cursor: 'pointer', fontSize: '0.9em', background: '#4CAF50', border: 'none', color: 'white', padding: '5px 15px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {isDownloading ? 'Generating...' : 'Download PDF'}
                        </button>
                        <button onClick={copyToken} style={{ cursor: 'pointer', fontSize: '0.8em', background: 'none', border: '1px solid #555', color: '#aaa', padding: '2px 8px', borderRadius: '4px' }}>Copy ID</button>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '20px', background: '#eef', minHeight: '100vh' }}>
                    <CVLayout
                        data={fullData}
                        styles={project.styles || {}}
                        isEditable={false} // Disable inline editing since we have sidebar
                        onDelete={deleteEntry}
                        onMove={moveEntry}
                        isMoving={isMoving}
                    />
                </div>
            </div>

            {/* Sidebar Editor */}
            <ProjectEditor
                project={project}
                entries={projectEntries}
                styles={project.styles || {}}
                onUpdateProject={updateProject}
                onEditEntry={(entry) => {
                    setEditingEntry(entry);
                    setIsEditorOpen(true);
                }}
                onDeleteEntry={deleteEntry}
                onReorderEntries={moveEntry} // Pass handler for Exp
                onReorderEducation={reorderEducation}
                onReorderCourses={reorderCourses}
            />

            {/* Modal for Experience Editing (still useful for rich details) */}
            {isEditorOpen && (
                <ExperienceEditor
                    projectId={projectId}
                    initialData={editingEntry}
                    onClose={() => { setIsEditorOpen(false); setEditingEntry(null); }}
                    onSuccess={() => fetchProjectData()}
                />
            )}
        </div>
    );
};

export default ProjectView;
