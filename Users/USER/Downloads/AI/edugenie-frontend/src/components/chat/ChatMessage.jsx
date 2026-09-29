import React, { useState } from 'react';
import { BotIcon, UserIcon, CopyIcon, CheckIcon, SparklesIcon, RefreshIcon } from '../Icons';
import { formatDate } from '../../utils/formatters';
import './ChatMessage.css';

const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(date);
    } catch {
        return '';
    }
};

/**
 * Parses simple markdown (code blocks, bold, lists, paragraphs)
 */
const renderFormattedContent = (content) => {
    if (!content) return null;

    // Handle code blocks ```code```
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
            const lines = part.slice(3, -3).trim().split('\n');
            let language = 'code';
            let codeContent = part.slice(3, -3).trim();

            if (lines.length > 1 && /^[a-zA-Z0-9_-]+$/.test(lines[0].trim())) {
                language = lines[0].trim();
                codeContent = lines.slice(1).join('\n');
            }

            return (
                <CodeBlock key={index} language={language} code={codeContent} />
            );
        }

        // Render formatted text for normal segments
        return (
            <div key={index} className="chat-text-segment">
                {part.split('\n\n').map((paragraph, pIdx) => {
                    if (!paragraph.trim()) return null;

                    // Bullet lists
                    if (paragraph.includes('\n- ') || paragraph.includes('\n* ') || paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                        const items = paragraph.split(/\n[-*]\s+/).filter(Boolean);
                        return (
                            <ul key={pIdx} className="chat-bullet-list">
                                {items.map((item, iIdx) => (
                                    <li key={iIdx}>{formatInline(item.replace(/^[-*]\s+/, ''))}</li>
                                ))}
                            </ul>
                        );
                    }

                    // Numbered lists
                    if (/^\d+\.\s+/.test(paragraph)) {
                        const items = paragraph.split(/\n\d+\.\s+/).filter(Boolean);
                        return (
                            <ol key={pIdx} className="chat-numbered-list">
                                {items.map((item, iIdx) => (
                                    <li key={iIdx}>{formatInline(item.replace(/^\d+\.\s+/, ''))}</li>
                                ))}
                            </ol>
                        );
                    }

                    // Headings (###)
                    if (paragraph.startsWith('### ') || paragraph.startsWith('## ') || paragraph.startsWith('# ')) {
                        const headingText = paragraph.replace(/^#+\s+/, '');
                        return <h4 key={pIdx} className="chat-subheading">{formatInline(headingText)}</h4>;
                    }

                    return <p key={pIdx}>{formatInline(paragraph)}</p>;
                })}
            </div>
        );
    });
};

const formatInline = (text) => {
    if (!text) return '';
    
    // Bold **text**
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        // Inline code `code`
        const inlineCodeParts = part.split(/(`.*?`)/g);
        return inlineCodeParts.map((subPart, j) => {
            if (subPart.startsWith('`') && subPart.endsWith('`')) {
                return <code key={`${i}-${j}`} className="chat-inline-code">{subPart.slice(1, -1)}</code>;
            }
            return subPart;
        });
    });
};

const CodeBlock = ({ language, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="chat-code-block">
            <div className="code-block-header">
                <span className="code-lang-label">{language}</span>
                <button
                    type="button"
                    className="copy-code-btn"
                    onClick={handleCopy}
                    title="Copy code"
                >
                    {copied ? (
                        <>
                            <CheckIcon size={13} />
                            <span>Copied</span>
                        </>
                    ) : (
                        <>
                            <CopyIcon size={13} />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <pre className="code-content">
                <code>{code}</code>
            </pre>
        </div>
    );
};

const ChatMessage = ({ message, user, onRetry }) => {
    const [copied, setCopied] = useState(false);
    const isUser = message.sender === 'user';
    const isError = message.isError;

    const handleCopyMessage = () => {
        if (!message.text) return;
        navigator.clipboard.writeText(message.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const timeString = formatTime(message.timestamp) || 'Just now';

    return (
        <div
            className={`chat-message-row ${isUser ? 'message-user' : 'message-ai'} ${
                isError ? 'message-has-error' : ''
            }`}
        >
            <div className="chat-avatar">
                {isUser ? (
                    <div className="avatar-circle user-avatar" title={user?.name || 'You'}>
                        {user?.name ? user.name.slice(0, 1).toUpperCase() : <UserIcon size={18} />}
                    </div>
                ) : (
                    <div className="avatar-circle ai-avatar" title="EduGenie AI">
                        <BotIcon size={19} />
                    </div>
                )}
            </div>

            <div className="chat-bubble-wrapper">
                <div className="chat-meta-header">
                    <span className="chat-sender-name">
                        {isUser ? user?.name || 'You' : 'EduGenie AI Tutor'}
                    </span>
                    {!isUser && (
                        <span className="ai-model-tag">
                            <SparklesIcon size={11} /> Gemini
                        </span>
                    )}
                    <span className="chat-timestamp" title={formatDate(message.timestamp)}>
                        {timeString}
                    </span>
                </div>

                <div className={`chat-bubble ${isError ? 'bubble-error' : ''}`}>
                    {renderFormattedContent(message.text)}

                    {isError && onRetry && (
                        <div className="error-retry-action">
                            <button
                                type="button"
                                className="chat-retry-btn"
                                onClick={() => onRetry(message)}
                            >
                                <RefreshIcon size={13} />
                                <span>Try Again</span>
                            </button>
                        </div>
                    )}
                </div>

                {!isUser && !isError && (
                    <div className="chat-bubble-actions">
                        <button
                            type="button"
                            className="chat-action-btn"
                            onClick={handleCopyMessage}
                            title="Copy entire response"
                        >
                            {copied ? (
                                <>
                                    <CheckIcon size={13} className="success-icon" />
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <CopyIcon size={13} />
                                    <span>Copy response</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;
