import React, { useRef, useEffect } from 'react';
import { SendIcon, SparklesIcon } from '../Icons';
import './ChatInput.css';

const DEFAULT_SUGGESTIONS = [
    'Explain Java inheritance',
    'Difference between SQL & NoSQL',
    'How does React useAuth hook work?',
    'Explain polymorphism with code examples',
];

const ChatInput = ({
    value,
    onChange,
    onSend,
    loading = false,
    disabled = false,
    placeholder = 'Ask EduGenie AI anything... (Press Enter to send)',
    suggestions = DEFAULT_SUGGESTIONS,
    onSelectSuggestion,
    showSuggestions = false,
}) => {
    const textareaRef = useRef(null);

    // Auto-resize textarea as user types
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
        }
    }, [value]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !loading && !disabled) {
                onSend();
            }
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (value.trim() && !loading && !disabled) {
            onSend();
        }
    };

    return (
        <div className="chat-input-wrapper">
            {showSuggestions && suggestions && suggestions.length > 0 && (
                <div className="chat-input-suggestions">
                    <span className="suggestions-badge">
                        <SparklesIcon size={12} /> Suggested
                    </span>
                    <div className="suggestions-scroll">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                className="suggestion-pill-btn"
                                onClick={() => onSelectSuggestion && onSelectSuggestion(suggestion)}
                                disabled={loading || disabled}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleFormSubmit} className="chat-input-form">
                <div className="chat-input-field-container">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="chat-input-textarea"
                        rows={1}
                        disabled={loading || disabled}
                        aria-label="Message input"
                    />

                    <div className="chat-input-actions">
                        <button
                            type="submit"
                            className={`chat-submit-btn ${value.trim() && !loading ? 'can-send' : ''}`}
                            disabled={!value.trim() || loading || disabled}
                            title="Send message (Enter)"
                            aria-label="Send message"
                        >
                            {loading ? (
                                <span className="input-spinner" />
                            ) : (
                                <SendIcon size={18} />
                            )}
                        </button>
                    </div>
                </div>

                <div className="chat-input-footer-hints">
                    <span className="shortcut-hint">
                        Press <kbd>Enter ↵</kbd> to send, <kbd>Shift + Enter</kbd> for new line
                    </span>
                    <span className="powered-by-hint">EduGenie AI • Powered by Gemini</span>
                </div>
            </form>
        </div>
    );
};

export default ChatInput;
