import React, { useState } from 'react';
import { aiService } from '../services/aiService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
    FileTextIcon,
    SparklesIcon,
    CopyIcon,
    CheckCircleIcon,
    BookIcon,
    AwardIcon,
} from '../components/Icons';
import './AiTools.css';

const AiStudyNotes = () => {
    const [topic, setTopic] = useState('');
    const [generating, setGenerating] = useState(false);
    const [notes, setNotes] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleGenerateNotes = async (e) => {
        e.preventDefault();
        if (!topic.trim()) {
            setError('Please enter a topic to generate study notes');
            return;
        }

        setGenerating(true);
        setError(null);
        setNotes(null);

        try {
            const data = await aiService.generateStudyNotes({ topic: topic.trim() });
            setNotes(data);
        } catch (err) {
            setError(err.message || 'Failed to generate study notes from AI');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopyAll = () => {
        if (!notes) return;
        const textToCopy = `
# Study Notes: ${notes.topic || topic}

## Overview
${notes.overview || ''}

## Important Concepts
${(notes.importantConcepts || []).map((c) => `- ${c}`).join('\n')}

## Key Takeaways
${(notes.keyPoints || []).map((p) => `- ${p}`).join('\n')}

## Practical Examples
${(notes.examples || []).map((e) => `- ${e}`).join('\n')}

## Common Mistakes to Avoid
${(notes.commonMistakes || []).map((m) => `- ${m}`).join('\n')}

## Interview Questions
${(notes.interviewQuestions || []).map((q) => `- ${q}`).join('\n')}

## Quick Revision
${notes.shortRevisionNotes || ''}
        `.trim();

        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="ai-notes-page">
            <div className="page-title-row">
                <div>
                    <h1 className="page-heading">AI Study Notes & Cheat Sheets</h1>
                    <p className="page-subheading">
                        Generate structured study guides, interview prep questions, and revision summaries with Gemini AI.
                    </p>
                </div>
            </div>

            {error && <ErrorMessage message={error} />}

            {/* Input Card */}
            <Card className="generator-control-card">
                <form onSubmit={handleGenerateNotes} className="generator-form">
                    <div className="notes-input-row">
                        <Input
                            label="What topic do you want to master?"
                            placeholder="e.g. JVM Memory Architecture, React Server Components, OAuth2 Authentication, Graph BFS vs DFS..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            required
                        />
                    </div>
                    <div className="generator-submit-row">
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            icon={SparklesIcon}
                            loading={generating}
                        >
                            Generate Comprehensive Study Notes
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Loading Indicator */}
            {generating && (
                <div className="ai-generating-banner">
                    <LoadingSpinner text={`Genie AI is curating structured study notes and interview prep on "${topic}"...`} />
                </div>
            )}

            {/* Generated Notes Display */}
            {notes && (
                <div className="study-notes-container">
                    <div className="notes-header-bar">
                        <div>
                            <span className="ai-gen-badge">
                                <SparklesIcon size={14} /> AI Generated Study Guide
                            </span>
                            <h2 className="notes-topic-title">{notes.topic || topic}</h2>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={CopyIcon}
                            onClick={handleCopyAll}
                        >
                            {copied ? 'Copied Full Notes!' : 'Copy Study Guide'}
                        </Button>
                    </div>

                    {/* Overview */}
                    {notes.overview && (
                        <Card title="📌 Overview & Core Definition" className="note-section-card">
                            <p className="note-prose">{notes.overview}</p>
                        </Card>
                    )}

                    {/* Grid of Key Concepts and Takeaways */}
                    <div className="notes-two-col-grid">
                        {notes.importantConcepts && notes.importantConcepts.length > 0 && (
                            <Card title="💡 Important Concepts" className="note-section-card">
                                <ul className="note-list">
                                    {notes.importantConcepts.map((item, idx) => (
                                        <li key={idx}>
                                            <span className="bullet-dot" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        {notes.keyPoints && notes.keyPoints.length > 0 && (
                            <Card title="🎯 Key Takeaways" className="note-section-card">
                                <ul className="note-list">
                                    {notes.keyPoints.map((item, idx) => (
                                        <li key={idx}>
                                            <CheckCircleIcon size={16} className="bullet-icon-check" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}
                    </div>

                    {/* Examples and Mistakes */}
                    <div className="notes-two-col-grid">
                        {notes.examples && notes.examples.length > 0 && (
                            <Card title="💻 Real-world & Code Examples" className="note-section-card">
                                <ul className="note-list">
                                    {notes.examples.map((item, idx) => (
                                        <li key={idx} className="code-example-item">
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        {notes.commonMistakes && notes.commonMistakes.length > 0 && (
                            <Card title="⚠️ Common Pitfalls & Mistakes" className="note-section-card card-warning-accent">
                                <ul className="note-list">
                                    {notes.commonMistakes.map((item, idx) => (
                                        <li key={idx}>
                                            <span className="pitfall-marker">✕</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}
                    </div>

                    {/* Interview Questions */}
                    {notes.interviewQuestions && notes.interviewQuestions.length > 0 && (
                        <Card title="🏆 High-Frequency Interview Questions" className="note-section-card">
                            <div className="interview-q-list">
                                {notes.interviewQuestions.map((q, idx) => (
                                    <div key={idx} className="interview-q-row">
                                        <span className="q-badge">Q{idx + 1}</span>
                                        <p>{q}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Short Revision Notes */}
                    {notes.shortRevisionNotes && (
                        <Card title="⚡ Quick 60-Second Revision Summary" className="note-section-card revision-card">
                            <p className="note-prose">{notes.shortRevisionNotes}</p>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default AiStudyNotes;
