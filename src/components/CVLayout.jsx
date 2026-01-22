import React, { useRef } from 'react';
import './CVLayout.css';
import useAutoFit from '../hooks/useAutoFit';
import { MapPin, Phone, Mail, Globe, Linkedin, Award } from 'lucide-react';

const CVLayout = ({ data, isEditable = false, onEdit, onDelete }) => {
    const containerRef = useRef(null);

    // Apply auto-fit logic
    useAutoFit(containerRef, data);

    return (
        <div className="cv-container" ref={containerRef}>
            {/* Header */}
            <header className="cv-header">
                {data.personalInfo.photoUrl && (
                    <div className="cv-photo-wrapper">
                        <img src={data.personalInfo.photoUrl} alt="Profile" className="cv-photo" />
                    </div>
                )}

                <div className="cv-header-info">
                    <h1 className="cv-name">{data.personalInfo.fullName}</h1>
                    <div className="cv-role" style={{ position: 'relative', display: 'inline-block' }}>
                        {data.personalInfo.role}
                        {isEditable && (
                            <button
                                onClick={() => onEdit({ role: 'role' })}
                                className="no-print"
                                style={{
                                    fontSize: '14px', border: 'none', background: 'none', cursor: 'pointer',
                                    paddingLeft: '10px', verticalAlign: 'middle', opacity: 0.5
                                }}
                                title="Edytuj Stanowisko"
                            >✏️</button>
                        )}
                    </div>

                    <div className="cv-contact-details">
                        <span className="cv-contact-item">
                            <MapPin size={14} className="cv-icon" /> {data.personalInfo.location}
                        </span>
                        <span className="cv-contact-item">
                            <Phone size={14} className="cv-icon" />
                            <a href={`tel:${data.personalInfo.phone}`}>{data.personalInfo.phone}</a>
                        </span>
                        <span className="cv-contact-item">
                            <Mail size={14} className="cv-icon" />
                            <a href={`mailto:${data.personalInfo.email}`}>{data.personalInfo.email}</a>
                        </span>
                        <span className="cv-contact-item" style={{ position: 'relative' }}>
                            <Globe size={14} className="cv-icon" />
                            <a
                                href={data.personalInfo.portfolio?.startsWith('http') ? data.personalInfo.portfolio : `https://${data.personalInfo.portfolio}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {data.personalInfo.portfolio?.replace(/^https?:\/\//, '')}
                            </a>
                            {isEditable && (
                                <button
                                    onClick={() => onEdit({ role: 'portfolio' })}
                                    className="no-print"
                                    style={{
                                        fontSize: '12px', border: 'none', background: 'none', cursor: 'pointer',
                                        paddingLeft: '5px', verticalAlign: 'middle', opacity: 0.5
                                    }}
                                    title="Edytuj Portfolio"
                                >✏️</button>
                            )}
                        </span>
                        <span className="cv-contact-item">
                            <Linkedin size={14} className="cv-icon" />
                            <a href={`https://${data.personalInfo.linkedin}`} target="_blank" rel="noreferrer">
                                {data.personalInfo.linkedin}
                            </a>
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Body Grid */}
            <div className="cv-body">

                {/* Left Column (Sidebar) */}
                <aside className="cv-sidebar">
                    {/* Education */}
                    <section className="cv-section">
                        <h2 className="cv-section-title">Edukacja</h2>
                        {data.education && data.education.map((edu, index) => (
                            <div key={index} className="cv-job-item">
                                <div className="cv-job-role">{edu.degree}</div>
                                <div className="cv-job-company">{edu.school}</div>
                                <div className="cv-job-date">{edu.year}</div>
                                {edu.description && <div className="cv-job-desc">{edu.description}</div>}
                            </div>
                        ))}
                    </section>

                    {/* Courses / Certificates (Stickers) */}
                    {data.courses && (
                        <section className="cv-section">
                            <h2 className="cv-section-title">Kursy i Certyfikaty</h2>
                            <div className="cv-stickers-container">
                                {data.courses.map((course, index) => (
                                    <img
                                        key={index}
                                        src={`/certyfikaty/${course.image}`}
                                        alt="Certificate"
                                        className="cv-certificate-img"
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </aside>

                {/* Right Column (Career) */}
                <main className="cv-main">
                    {/* Summary */}
                    {data.summary && (
                        <section className="cv-section" style={{ position: 'relative' }}>
                            <h2 className="cv-section-title">Podsumowanie</h2>
                            {isEditable && (
                                <button
                                    onClick={() => onEdit({ id: 'summary', description: data.summary, role: 'summary' })}
                                    className="no-print"
                                    style={{
                                        position: 'absolute',
                                        right: '-30px',
                                        top: '0',
                                        cursor: 'pointer',
                                        border: 'none',
                                        background: 'none',
                                        fontSize: '14px'
                                    }}
                                    title="Edytuj Podsumowanie"
                                >
                                    ✏️
                                </button>
                            )}
                            <p className="cv-job-desc">{data.summary}</p>
                        </section>
                    )}

                    {/* Experience */}
                    <section className="cv-section">
                        <h2 className="cv-section-title">Doświadczenie</h2>
                        {data.experience && data.experience.map((job, index) => (
                            <div key={index} className="cv-job-item" style={{ position: 'relative' }}>
                                {isEditable && (
                                    <div className="no-print" style={{
                                        position: 'absolute',
                                        right: '-50px',
                                        top: '0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '5px'
                                    }}>
                                        <button onClick={() => onEdit(job)} title="Edytuj" style={{ cursor: 'pointer', border: 'none', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', padding: '4px', borderRadius: '4px', fontSize: '14px' }}>✏️</button>
                                        <button onClick={() => onDelete(job.id)} title="Usuń" style={{ cursor: 'pointer', border: 'none', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', padding: '4px', borderRadius: '4px', fontSize: '14px', color: 'red' }}>🗑️</button>
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
                                        <li key={i}>{line}</li>
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
        </div>
    );
};

export default CVLayout;
