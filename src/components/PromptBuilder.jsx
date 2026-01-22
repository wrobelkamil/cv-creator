import React, { useState } from 'react';
import { staticData } from '../data/staticData';

const PromptBuilder = ({ onClose }) => {
    const [jobOffer, setJobOffer] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');

    const generatePrompt = () => {
        // Construct the context string from master data
        const context = `
MY PROFILE (DATABASE):
Name: ${staticData.personalInfo.fullName}
Role: ${staticData.personalInfo.role}
Summary: ${staticData.summary}

EXPERIENCE DATABASE:
${staticData.masterExperience.map(exp => `
- Company: ${exp.company}
- Role: ${exp.role}
- Period: ${exp.period}
- Description: ${exp.description}
`).join('\n')}

SKILLS: ${staticData.skills.join(', ')}
    `.trim();

        const prompt = `
I need you to tailor my generic CV for a specific Job Offer.

JOB OFFER:
"${jobOffer}"

MY BASE DATA (Attach this to your context):
${context}

INSTRUCTIONS:
1. Analyze the Job Offer.
2. Select the most relevant experience points from "MY BASE DATA". You can rephrase them slightly to match the keywords in the offer, but keep the facts true. 
3. Generate a JSON Personal Profile (Summary) tailored to this offer.
4. Generate a JSON list of Matched Skills (max 6).
5. Output EXCLUSIVELY JSON in this format:
{
  "summary": "Tailored summary string...",
  "experience": [
    {
      "company": "String",
      "role": "String",
      "period": "String",
      "description": "String (Optimized bullets)"
    }
  ],
  "matchedSkills": ["Skill1", "Skill2"]
}
    `.trim();

        setGeneratedPrompt(prompt);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedPrompt);
        alert("Prompt copied! Now paste it into ChatGPT.");
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1100, fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                background: 'white', padding: '30px', borderRadius: '12px', width: '800px', maxWidth: '95%',
                display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>Smart Prompt Builder 🧠</h2>
                    <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                </div>

                <p style={{ color: '#666', fontSize: '0.9em' }}>
                    Paste the job offer below. The system will combine it with your master experience database to create a perfect prompt for ChatGPT.
                </p>

                <textarea
                    value={jobOffer}
                    onChange={(e) => setJobOffer(e.target.value)}
                    placeholder="Paste Job Offer Title and Description here..."
                    style={{ width: '100%', height: '150px', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />

                <button
                    onClick={generatePrompt}
                    disabled={!jobOffer}
                    style={{
                        padding: '12px', background: !jobOffer ? '#ccc' : '#000', color: 'white',
                        border: 'none', borderRadius: '6px', cursor: !jobOffer ? 'not-allowed' : 'pointer', fontWeight: '600'
                    }}
                >
                    Generate Prompt
                </button>

                {generatedPrompt && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontWeight: '600', fontSize: '0.9em' }}>Ready-to-use Prompt:</label>
                        <textarea
                            readOnly
                            value={generatedPrompt}
                            style={{ width: '100%', height: '200px', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', background: '#f9f9f9', fontSize: '0.85em', fontFamily: 'monospace' }}
                        />
                        <button
                            onClick={copyToClipboard}
                            style={{
                                padding: '12px', background: '#2563eb', color: 'white',
                                border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
                            }}
                        >
                            Copy Prompt to Clipboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromptBuilder;
