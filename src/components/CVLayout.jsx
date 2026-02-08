import React, { useRef } from 'react';
import './CVLayout.css';
import useAutoFit from '../hooks/useAutoFit';
import { MapPin, Phone, Mail, Globe, Linkedin, Award } from 'lucide-react';

// Helper to fix orphans (hanging single letter words)
const fixOrphans = (text) => {
    if (!text) return "";
    // Regex for single letters flanked by spaces (or start of line)
    return text.replace(/ ([aiouwzAIOUWZ]) /g, ' $1\u00A0');
};

const CVLayout = ({ data, styles = {}, isEditable = false, onEdit, onDelete, onMove, isMoving }) => {
    // Styles
    const { imageShape = 'circle', nameUppercase = false, primaryColor = '#333', accentColor = '#666' } = styles;
    const containerRef = useRef(null);

    // Apply auto-fit logic
    useAutoFit(containerRef, data);

    const renderCourses = () => {
        if (!data.courses || data.courses.length === 0) return null;

        const mode = data.coursesDisplayMode || 'icons';

        return (
            <section className="cv-section">
                <h2 className="cv-section-title" style={{ color: primaryColor, borderBottomColor: primaryColor }}>Kursy i Certyfikaty</h2>

                {mode === 'icons' ? (
                    <div className="cv-stickers-container">
                        {data.courses.map((course, index) => {
                            const imgSrc = course.image?.startsWith('http') ? course.image : `/certyfikaty/${course.image}`;
                            return (
                                <img
                                    key={index}
                                    src={imgSrc}
                                    alt={course.name}
                                    className="cv-certificate-img"
                                    title={`${course.name} (${course.year})`}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <ul className="cv-courses-list">
                        {data.courses.map((course, index) => (
                            <li key={index} style={{ marginBottom: '5px', fontSize: '0.9em' }}>
                                <span style={{ fontWeight: 'bold' }}>{course.year}</span> - {course.name}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        );
    };

    return (
        <div className="cv-container" ref={containerRef}>
            {/* Header */}
            <header className="cv-header">
                {data.personalInfo.photoUrl && (
                    <div
                        className="cv-photo-wrapper"
                        style={{ borderRadius: imageShape === 'circle' ? '50%' : imageShape === 'rounded' ? '15px' : '0' }}
                    >
                        <img
                            src={data.personalInfo.photoUrl}
                            alt="Profile"
                            className="cv-photo"
                        />
                    </div>
                )}

                <div className="cv-header-info">
                    <h1 className="cv-name" style={{ textTransform: nameUppercase ? 'uppercase' : 'none' }}>{data.personalInfo.fullName}</h1>
                    <div className="cv-role" style={{ position: 'relative', display: 'inline-block', color: accentColor }}>
                        {data.personalInfo.role}
                        {isEditable && (
                            <button onClick={() => onEdit({ role: 'role' })} className="no-print edit-btn" title="Edytuj Stanowisko">✏️</button>
                        )}
                    </div>

                    <div className="cv-contact-details">
                        {data.personalInfo.location && (
                            <span className="cv-contact-item">
                                <MapPin size={14} className="cv-icon" color={accentColor} /> {data.personalInfo.location}
                            </span>
                        )}
                        {data.personalInfo.phone && (
                            <span className="cv-contact-item">
                                <Phone size={14} className="cv-icon" color={accentColor} />
                                <a href={`tel:${data.personalInfo.phone}`}>{data.personalInfo.phone}</a>
                            </span>
                        )}
                        {data.personalInfo.email && (
                            <span className="cv-contact-item">
                                <Mail size={14} className="cv-icon" color={accentColor} />
                                <a href={`mailto:${data.personalInfo.email}`}>{data.personalInfo.email}</a>
                            </span>
                        )}
                        {data.personalInfo.portfolio && (
                            <span className="cv-contact-item" style={{ position: 'relative' }}>
                                <Globe size={14} className="cv-icon" color={accentColor} />
                                <a
                                    href={data.personalInfo.portfolio?.startsWith('http') ? data.personalInfo.portfolio : `https://${data.personalInfo.portfolio}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {data.personalInfo.portfolio?.replace(/^https?:\/\//, '')}
                                </a>
                                {isEditable && (
                                    <button onClick={() => onEdit({ role: 'portfolio' })} className="no-print edit-btn" title="Edytuj Portfolio">✏️</button>
                                )}
                            </span>
                        )}
                        {data.personalInfo.linkedin && (
                            <span className="cv-contact-item">
                                <Linkedin size={14} className="cv-icon" color={accentColor} />
                                <a href={`https://${data.personalInfo.linkedin}`} target="_blank" rel="noreferrer">
                                    {data.personalInfo.linkedin}
                                </a>
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Body Grid */}
            <div className="cv-body">

                {/* Left Column (Sidebar) */}
                <aside className="cv-sidebar">
                    {/* Education */}
                    <section className="cv-section">
                        <h2 className="cv-section-title" style={{ color: primaryColor, borderBottomColor: primaryColor }}>Edukacja</h2>
                        {data.education && data.education.map((edu, index) => (
                            <div key={index} className="cv-job-item">
                                <div className="cv-job-role" style={{ color: accentColor }}>{edu.degree}</div>
                                <div className="cv-job-company">{edu.school}</div>
                                <div className="cv-job-date">{edu.year}</div>
                                {edu.description && <div className="cv-job-desc">{fixOrphans(edu.description)}</div>}
                            </div>
                        ))}
                    </section>

                    {/* Courses / Certificates */}
                    {renderCourses()}
                </aside>

                {/* Right Column (Career) */}
                <main className="cv-main">
                    {/* Summary */}
                    {data.summary && (
                        <section className="cv-section" style={{ position: 'relative' }}>
                            <h2 className="cv-section-title" style={{ color: primaryColor, borderBottomColor: primaryColor }}>Podsumowanie</h2>
                            {isEditable && (
                                <button onClick={() => onEdit({ id: 'summary', description: data.summary, role: 'summary' })} className="no-print edit-btn-abs" title="Edytuj Podsumowanie">✏️</button>
                            )}
                            <p className="cv-job-desc">{fixOrphans(data.summary)}</p>
                        </section>
                    )}

                    {/* Experience */}
                    <section className="cv-section">
                        <h2 className="cv-section-title" style={{ color: primaryColor, borderBottomColor: primaryColor }}>Doświadczenie</h2>
                        {data.experience && data.experience.map((job, index) => (
                            <div key={index} className="cv-job-item" style={{ position: 'relative' }}>
                                {/* Inline controls for legacy editing - hidden if isEditable is false anyway */}
                                {isEditable && (
                                    <div className="no-print legacy-controls">
                                        <button onClick={() => onEdit(job)}>✏️</button>
                                        <button onClick={() => onDelete(job.id)} style={{ color: 'red' }}>🗑️</button>
                                        <div style={{ display: 'flex', gap: '2px', marginTop: '5px' }}>
                                            {index > 0 && <button onClick={() => onMove && onMove(index, -1)} disabled={isMoving}>⬆️</button>}
                                            {index < data.experience.length - 1 && <button onClick={() => onMove && onMove(index, 1)} disabled={isMoving}>⬇️</button>}
                                        </div>
                                    </div>
                                )}
                                <div className="cv-job-header">
                                    <div>
                                        <span className="cv-job-role">{job.role}</span> <span style={{ color: '#ccc', margin: '0 5px' }}>•</span> <span className="cv-job-company">{job.company}</span>
                                    </div>
                                    <span className="cv-job-date">{job.period}</span>
                                </div>
                                <ul className="cv-job-desc-list">
                                    {job.description && job.description.split('\n').map((line, i) => line.trim() && (
                                        <li key={i}>{fixOrphans(line)}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </section>
                </main>
            </div>

            {/* Footer (RODO) */}
            <footer className="cv-footer">
                Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)).
            </footer>

            <style>{`
                .edit-btn {
                    font-size: 14px; border: none; background: none; cursor: pointer;
                    padding-left: 10px; vertical-align: middle; opacity: 0.5;
                }
                .edit-btn-abs {
                    position: absolute; right: -30px; top: 0; cursor: pointer;
                    border: none; background: none; font-size: 14px;
                }
                .legacy-controls {
                    position: absolute; right: -50px; top: 0; display: flex; flexDirection: column; gap: 5px;
                }
                .legacy-controls button {
                    cursor: pointer; border: none; background: #fff; boxShadow: 0 1px 3px rgba(0,0,0,0.2); padding: 4px; borderRadius: 4px; font-size: 14px;
                }
            `}</style>
        </div>
    );
};

export default CVLayout;
