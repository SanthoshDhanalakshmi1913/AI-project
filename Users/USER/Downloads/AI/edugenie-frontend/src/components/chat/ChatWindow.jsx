import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import {
    BotIcon,
    TrashIcon,
    SparklesIcon,
    MenuIcon,
    RefreshIcon,
    BookIcon,
    LayersIcon,
} from '../Icons';
import './ChatWindow.css';

const WELCOME_SUGGESTIONS = [
    {
        title: 'Explain Java inheritance',
        desc: 'Understand subclasses, super keyword, method overriding, and polymorphism.',
        prompt: 'Explain Java inheritance with simple code examples and best practices.',
    },
    {
        title: 'React Hooks & State',
        desc: 'Learn how useEffect dependencies and custom hooks work together.',
        prompt: 'How do React hooks and the useEffect dependency array work in depth?',
    },
    {
        title: 'Database Architecture',
        desc: 'Compare relational SQL schemas with NoSQL document stores.',
        prompt: 'Explain the key differences between SQL and NoSQL databases with use cases.',
    },
    {
        title: 'Spring Boot Fundamentals',
        desc: 'Understand Dependency Injection and Spring Web architecture.',
        prompt: 'Give me a clear overview of Spring Boot architecture and Dependency Injection.',
    },
];

const ChatWindow = ({
    messages = [],
    loading = false,
    error = null,
    onClearChat,
    onToggleSidebar,
    onSendMessage,
    onSelectSuggestion,
    onRetry,
    inputPrompt,
    setInputPrompt,
    user,
}) => {
    const scrollContainerRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Scroll to bottom when messages or loading state changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const isChatEmpty = messages.length === 0;

    return (
        <div className="chat-window-main">
            {/* Top Navigation / Header */}
            <header className="chat-window-header">
                <div className="chat-header-left">
                    {onToggleSidebar && (
                        <button
                            type="button"
                            className="chat-toggle-sidebar-btn"
                            onClick={onToggleSidebar}
                            aria-label="Toggle chat history"
                            title="Chat History"
                        >
                            <MenuIcon size={20} />
                        </button>
                    )}

                    <div className="chat-tutor-avatar-box">
                        <div className="tutor-avatar">
                            <BotIcon size={22} />
                            <span className="tutor-status-dot" title="Online" />
                        </div>
                        <div className="tutor-info">
                            <div className="tutor-name-row">
                                <h2 className="tutor-name">EduGenie AI Assistant</h2>
                                <span className="tutor-badge">24/7 Tutor</span>
                            </div>
                            <p className="tutor-status-text">
                                Powered by Google Gemini • Ready to help you learn
                            </p>
                        </div>
                    </div>
                </div>

                <div className="chat-header-actions">
                    <button
                        type="button"
                        className="chat-clear-btn"
                        onClick={onClearChat}
                        title="Clear current chat"
                    >
                        <TrashIcon size={16} />
                        <span className="clear-btn-text">Clear Chat</span>
                    </button>
                </div>
            </header>

            {/* Error Message Banner if error occurs */}
            {error && (
                <div className="chat-error-banner" role="alert">
                    <div className="error-banner-content">
                        <span className="error-icon">⚠️</span>
                        <div className="error-text">
                            <strong>Connection Error:</strong> {error}
                        </div>
                    </div>
                    {onRetry && (
                        <button
                            type="button"
                            className="error-retry-banner-btn"
                            onClick={() => onRetry()}
                        >
                            <RefreshIcon size={13} />
                            <span>Retry</span>
                        </button>
                    )}
                </div>
            )}

            {/* Message Stream Area */}
            <div className="chat-messages-container" ref={scrollContainerRef}>
                {isChatEmpty ? (
                    <div className="chat-empty-welcome">
                        <div className="welcome-hero-icon">
                            <SparklesIcon size={36} />
                        </div>
                        <h3 className="welcome-title">
                            Hello {user?.name ? user.name.split(' ')[0] : 'there'}! What would you like to learn today?
                        </h3>
                        <p className="welcome-subtitle">
                            Ask any concept doubt, code debugging question, homework assistance, or quiz preparation.
                        </p>

                        <div className="welcome-prompt-grid">
                            {WELCOME_SUGGESTIONS.map((item, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className="welcome-card"
                                    onClick={() => onSelectSuggestion && onSelectSuggestion(item.prompt)}
                                >
                                    <div className="welcome-card-header">
                                        <span className="welcome-card-title">{item.title}</span>
                                        <SparklesIcon size={14} className="welcome-card-sparkle" />
                                    </div>
                                    <p className="welcome-card-desc">{item.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="chat-messages-list">
                        {messages.map((msg, index) => (
                            <ChatMessage
                                key={msg.id || index}
                                message={msg}
                                user={user}
                                onRetry={onRetry}
                            />
                        ))}

                        {/* AI Thinking / Loading Indicator */}
                        {loading && (
                            <div className="chat-message-row message-ai message-thinking">
                                <div className="chat-avatar">
                                    <div className="avatar-circle ai-avatar">
                                        <BotIcon size={19} />
                                    </div>
                                </div>
                                <div className="chat-bubble-wrapper">
                                    <div className="chat-meta-header">
                                        <span className="chat-sender-name">EduGenie AI Tutor</span>
                                        <span className="ai-model-tag">
                                            <SparklesIcon size={11} /> Gemini
                                        </span>
                                    </div>
                                    <div className="chat-bubble typing-bubble">
                                        <div className="typing-dots">
                                            <span className="dot" />
                                            <span className="dot" />
                                            <span className="dot" />
                                        </div>
                                        <span className="typing-label">EduGenie AI is preparing your explanation...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Bottom Input */}
            <ChatInput
                value={inputPrompt}
                onChange={setInputPrompt}
                onSend={onSendMessage}
                loading={loading}
                disabled={loading}
                onSelectSuggestion={onSelectSuggestion}
                showSuggestions={!isChatEmpty && messages.length <= 4}
            />
        </div>
    );
};

export default ChatWindow;
