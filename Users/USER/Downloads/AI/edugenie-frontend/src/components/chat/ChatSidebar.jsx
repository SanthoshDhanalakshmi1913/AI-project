import React, { useState } from 'react';
import {
    PlusIcon,
    MessageSquareIcon,
    SearchIcon,
    TrashIcon,
    CloseIcon,
    SparklesIcon,
    BotIcon,
} from '../Icons';
import { formatRelativeTime, truncateText } from '../../utils/formatters';
import './ChatSidebar.css';

const ChatSidebar = ({
    conversations = [],
    activeId = null,
    onSelectConversation,
    onNewChat,
    onDeleteConversation,
    isOpen = false,
    onClose,
    loading = false,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = conversations.filter((c) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const questionMatch = c.question?.toLowerCase().includes(query);
        const answerMatch = c.answer?.toLowerCase().includes(query);
        return questionMatch || answerMatch;
    });

    return (
        <>
            {isOpen && <div className="chat-sidebar-backdrop" onClick={onClose} />}
            <aside className={`chat-history-sidebar ${isOpen ? 'is-open' : ''}`}>
                {/* Top Action: New Chat Button */}
                <div className="chat-sidebar-header">
                    <button
                        type="button"
                        className="new-chat-btn"
                        onClick={() => {
                            onNewChat && onNewChat();
                            onClose && onClose();
                        }}
                    >
                        <PlusIcon size={18} />
                        <span>New Chat</span>
                    </button>

                    {onClose && (
                        <button
                            type="button"
                            className="chat-sidebar-mobile-close"
                            onClick={onClose}
                            aria-label="Close chat sidebar"
                        >
                            <CloseIcon size={18} />
                        </button>
                    )}
                </div>

                {/* Search in conversations */}
                {conversations.length > 0 && (
                    <div className="chat-sidebar-search">
                        <SearchIcon size={14} className="sidebar-search-icon" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="sidebar-search-input"
                        />
                    </div>
                )}

                {/* Previous Conversations List */}
                <div className="chat-conversations-section">
                    <div className="conversations-header-label">
                        <span>Previous Conversations</span>
                        <span className="conversations-count-badge">
                            {filteredConversations.length}
                        </span>
                    </div>

                    <div className="chat-conversations-list">
                        {loading ? (
                            <div className="sidebar-loading-state">
                                <span className="sidebar-spinner" />
                                <span>Loading conversations...</span>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="sidebar-empty-state">
                                <MessageSquareIcon size={28} className="empty-icon" />
                                <p className="empty-title">
                                    {searchQuery ? 'No matching chats' : 'No previous chats'}
                                </p>
                                <p className="empty-subtitle">
                                    {searchQuery
                                        ? 'Try a different search keyword'
                                        : 'Your AI learning conversations will be saved here.'}
                                </p>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => {
                                const id = conv.conversationId || conv.id;
                                const isActive = activeId === id;
                                const title = conv.question || conv.title || 'Learning Conversation';
                                const timeStr = formatRelativeTime(conv.createdAt || conv.timestamp);

                                return (
                                    <div
                                        key={id}
                                        className={`conversation-item ${isActive ? 'active' : ''}`}
                                        onClick={() => {
                                            onSelectConversation && onSelectConversation(conv);
                                            onClose && onClose();
                                        }}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div className="conversation-item-icon">
                                            <MessageSquareIcon size={16} />
                                        </div>

                                        <div className="conversation-item-body">
                                            <span className="conversation-title" title={title}>
                                                {truncateText(title, 42)}
                                            </span>
                                            {timeStr && (
                                                <span className="conversation-time">
                                                    {timeStr}
                                                </span>
                                            )}
                                        </div>

                                        {onDeleteConversation && (
                                            <button
                                                type="button"
                                                className="conversation-delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteConversation(id, e);
                                                }}
                                                title="Delete conversation"
                                                aria-label="Delete conversation"
                                            >
                                                <TrashIcon size={14} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="chat-sidebar-footer">
                    <div className="ai-engine-badge">
                        <div className="ai-engine-icon">
                            <BotIcon size={16} />
                        </div>
                        <div className="ai-engine-info">
                            <span className="ai-engine-title">EduGenie AI v2.0</span>
                            <span className="ai-engine-model">Google Gemini 1.5</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default ChatSidebar;
